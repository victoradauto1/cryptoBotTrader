import { NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

import { CONTRACT_ADDRESSES } from '@/utils/constants';
import botManagerAbi from '@/abi/TradingBotManager.json';
import tradeExecutorAbi from '@/abi/TradeExecutor.json';

// Force route to always run on the server (no cache) and allow longer execution
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s max on Vercel (Hobby plan = 10s, Pro = 60s)

export async function GET(request: Request) {
  try {
    // 1. Security Validation (Auth only)
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET && 
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    const executorAddress = process.env.NEXT_PUBLIC_TRADE_EXECUTOR_ADDRESS as `0x${string}`;

    if (!privateKey || !privateKey.startsWith('0x')) {
      return NextResponse.json({ error: 'ADMIN_PRIVATE_KEY ausente ou inválida' }, { status: 500 });
    }
    if (!executorAddress) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_TRADE_EXECUTOR_ADDRESS ausente no .env' }, { status: 500 });
    }

    // 3. Client Configuration (RPC)
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http()
    });
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http()
    });

    const botCount = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.TradingBotManager,
      abi: botManagerAbi,
      functionName: 'botCount',
    }) as bigint;

    if (botCount === BigInt(0)) {
      return NextResponse.json({ message: 'Nenhum bot cadastrado' });
    }

    // 5. Current Oracle Price for realistic simulation ($3000 initial fallback)
    let currentPrice = BigInt(300000000000); // $3000 (8 Decimals)
    try {
      currentPrice = await publicClient.readContract({
        address: executorAddress,
        abi: (tradeExecutorAbi as any).abi,
        functionName: 'getLatestPrice',
      }) as bigint;
    } catch (e) {
      console.warn("Aviso: Falha ao ler oráculo. Utilizando preço fixo para simulação.", e);
    }

    const executedBots: number[] = [];
    const errors: string[] = [];

    for (let i = 0; i < Number(botCount); i++) {
        try {
            const botInfo = await publicClient.readContract({
                address: CONTRACT_ADDRESSES.TradingBotManager,
                abi: botManagerAbi,
                functionName: 'bots',
                args: [BigInt(i)],
            }) as [string, bigint, boolean];

            const [, balance, active] = botInfo;

            // Skip deactivated bots or those with no balance
            if (!active || balance === BigInt(0)) continue;

            const tradeAmount = balance / BigInt(10); // Risk 10% of balance
            if (tradeAmount === BigInt(0)) continue;

            // Randomize Win/Loss (50/50) in LONG (direction true)
            const willWin = Math.random() > 0.5;
            const direction = true; 
            const priceDifference = BigInt(100000000); // $1.00 difference
            const referencePrice = willWin 
              ? currentPrice - priceDifference 
              : currentPrice + priceDifference;

            const { request: execRequest } = await publicClient.simulateContract({
                account,
                address: executorAddress,
                abi: (tradeExecutorAbi as any).abi,
                functionName: 'executeSimulatedTrade',
                args: [BigInt(i), tradeAmount, direction, referencePrice],
            });

            const txHash = await walletClient.writeContract(execRequest);
            
            executedBots.push(i);

        } catch (botError: any) {
            console.error(`Erro Bot #${i}:`, botError.shortMessage || botError.message);
            errors.push(`Bot #${i}: ${botError.shortMessage || 'Erro desconhecido'}`);
        }
    }

    return NextResponse.json({
      message: 'Cron execution finished',
      executedBots,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (err: any) {
    console.error("Cron Fatal Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
