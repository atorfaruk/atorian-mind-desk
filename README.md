# Atorian Mind Desk

AI-powered crypto research and decision-support workstation built for the Bitget AI Trading Desk competition.

## Live Demo

https://atorian-mind-desk.vercel.app

## GitHub

https://github.com/atorfaruk/atorian-mind-desk

## Overview

Atorian Mind Desk is an AI-powered crypto research workstation that helps traders understand live market conditions, analyze risks, and stress-test trading decisions before taking action.

The product follows a human-in-the-loop workflow:

**Live Market Data → AI Research → Risk Analysis → Stress Testing → Human Decision**

The AI supports the trader's research and decision-making process rather than making autonomous trading decisions.

## Problem

Crypto traders often have to combine market data, research, risk assessment, and scenario analysis across multiple tools.

This creates fragmented workflows and makes it difficult to quickly answer questions such as:

- What is happening with this asset?
- What are the key risks?
- What could happen if the market moves against my position?
- How strong is the current market thesis?
- What scenarios should I consider before making a decision?

Atorian Mind Desk brings these research and decision-support capabilities into one workspace.

## Target User

The primary target user is the active retail crypto trader who:

- Regularly researches individual crypto assets.
- Wants faster market research without giving up control.
- Wants to understand downside and upside risks.
- Wants AI-assisted analysis in one workspace.
- Uses AI as a research assistant rather than an autonomous trader.

## Core Features

### 1. Live Market Data

The dashboard retrieves current market information and displays:

- Trading pair
- Current price
- 24-hour price change
- Market reference data

Bitget is used as the primary market-data source, with CoinGecko used as a reference source when available.

### 2. AI Market Research

Users can interact with the system using natural-language market questions.

The AI receives the available market context and generates structured research insights to help users understand current market conditions.

The AI provider architecture uses multiple providers for resilience:

**Groq → OpenRouter → Gemini**

### 3. Risk Analysis

Atorian Mind Desk helps users evaluate important market risks surrounding an asset, including price movement, volatility context, and factors that may affect a trading decision.

### 4. Decision Stress Testing

Users can evaluate potential market scenarios around the current price.

Example scenarios include:

- 10% downside
- 5% downside
- 5% upside

This encourages users to consider multiple possible outcomes before making a decision.

### 5. Human-in-the-Loop Decision Making

Atorian Mind Desk does not autonomously execute trades.

The system provides research, analysis, risk context, and decision-support information while the trader remains responsible for the final decision.

## Role of AI

The AI acts as a natural-language crypto research assistant.

It:

1. Interprets the trader's question.
2. Receives current market context.
3. Generates research insights.
4. Identifies relevant risks and market factors.
5. Helps the trader evaluate potential scenarios.

The AI does not independently place trades.

## Technology Stack

- React
- Vite
- JavaScript
- Node.js
- Groq
- OpenRouter
- Google Gemini
- Bitget market data
- CoinGecko reference data
- Vercel

## Architecture

```text
                    User
                      ↓
              Atorian Mind Desk
                      ↓
             Live Market Data
                      ↓
                AI Research
                      ↓
              Risk Analysis
                      ↓
             Stress Testing
                      ↓
              Human Decision


## AI Provider Architecture

                AI Request
                     ↓
                   Groq
                     ↓
              If unavailable
                     ↓
                OpenRouter
                     ↓
              If unavailable
                     ↓
                  Gemini
                     ↓
             Structured Analysis