# Atorian Mind Desk

AI-powered crypto research and decision stress-testing workstation built for the Bitget AI Trading Desk competition.

## Live Demo

https://atorian-mind-desk.vercel.app

## GitHub

https://github.com/atorfaruk/atorian-mind-desk

## Overview

Atorian Mind Desk helps crypto traders research markets, understand risks, and stress-test decisions before taking action.

The product follows a human-in-the-loop workflow:

**Live Market Data → AI Research → Risk Analysis → Stress Test → Human Decision**

The AI supports the trader's research process rather than making autonomous trading decisions.

## Problem

Crypto traders often have to combine market data, research, risk assessment, and scenario analysis across multiple tools.

This creates fragmented workflows and makes it difficult to quickly answer questions such as:

- What is happening with this asset?
- What are the key risks?
- What could happen if the market moves against my position?
- How strong is the current market thesis?

Atorian Mind Desk brings these research and decision-support steps into one workspace.

## Target User

The primary target is the active retail crypto trader who:

- Trades spot or other liquid crypto markets.
- Regularly researches individual assets.
- Wants faster market research without giving up control.
- Wants to understand downside risk before making a decision.
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

Users can ask natural-language questions about the current market.

The AI interprets the question together with the available market context and produces structured research insights.

### 3. Risk Analysis

The system highlights important risk information, including recent price movement, volatility context, and key market factors.

### 4. Decision Stress Testing

Users can examine potential downside and upside scenarios around the current market price.

Example scenarios include:

- -10% downside
- -5% downside
- +5% upside

This helps traders think about possible outcomes before making a decision.

### 5. Human-in-the-Loop Decision Making

Atorian Mind Desk does not autonomously execute trades.

The AI provides research, risk analysis, and stress-testing support while the trader remains responsible for the final decision.

## Role of AI

The LLM acts as a natural-language crypto research assistant.

It:

1. Interprets the trader's question.
2. Receives current market context.
3. Generates research insights.
4. Identifies relevant risks and factors.
5. Helps the trader evaluate potential scenarios.

The AI does not independently place trades.

## Technology Stack

- React
- Vite
- JavaScript
- Node.js
- Express
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