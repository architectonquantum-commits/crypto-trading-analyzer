import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
from app.models.macro_analysis import (
    CorrelationData, CorrelationsAnalysis, NewsItem, NewsAnalysis,
    DominanceAnalysis, MacroAnalysisResponse
)

class MacroAnalysisModule:

    def calculate_correlation(self, df1: pd.DataFrame, df2: pd.DataFrame, asset1: str, asset2: str) -> CorrelationData:
        df1 = df1.set_index("timestamp")
        df2 = df2.set_index("timestamp")
        common_index = df1.index.intersection(df2.index)[-30:]

        if len(common_index) < 10:
            return CorrelationData(
                asset_1=asset1,
                asset_2=asset2,
                correlation=0.0,
                strength="neutral",
                interpretation="Datos insuficientes"
            )

        prices1 = df1.loc[common_index, "close"]
        prices2 = df2.loc[common_index, "close"]
        correlation = prices1.corr(prices2)

        if correlation >= 0.7:
            strength = "strong_positive"
            interpretation = f"{asset1} y {asset2} se mueven fuertemente juntos"
        elif correlation >= 0.3:
            strength = "positive"
            interpretation = f"{asset1} y {asset2} tienen correlacion positiva moderada"
        elif correlation >= -0.3:
            strength = "neutral"
            interpretation = f"{asset1} y {asset2} no tienen correlacion clara"
        elif correlation >= -0.7:
            strength = "negative"
            interpretation = f"{asset1} y {asset2} tienden a moverse en direcciones opuestas"
        else:
            strength = "strong_negative"
            interpretation = f"{asset1} y {asset2} se mueven fuertemente en direcciones opuestas"

        return CorrelationData(
            asset_1=asset1,
            asset_2=asset2,
            correlation=round(correlation, 3),
            strength=strength,
            interpretation=interpretation
        )

    def analyze_correlations(self, symbol: str, df_asset: pd.DataFrame, df_btc: pd.DataFrame, df_eth: pd.DataFrame) -> CorrelationsAnalysis:
        btc_eth_corr = self.calculate_correlation(df_btc, df_eth, "BTC", "ETH")

        btc_market_corr = None
        if symbol.upper() != "BTC/USDT":
            btc_market_corr = self.calculate_correlation(df_btc, df_asset, "BTC", symbol.split("/")[0])

        btc_trend = df_btc["close"].iloc[-1] > df_btc["close"].iloc[-10]
        eth_trend = df_eth["close"].iloc[-1] > df_eth["close"].iloc[-10]

        if btc_trend and eth_trend:
            trend_alignment = "bullish"
        elif not btc_trend and not eth_trend:
            trend_alignment = "bearish"
        else:
            trend_alignment = "mixed"

        score = 0
        if btc_eth_corr.correlation >= 0.7:
            score += 1
        if trend_alignment == "bullish":
            score += 1

        return CorrelationsAnalysis(
            btc_eth_correlation=btc_eth_corr,
            btc_market_correlation=btc_market_corr,
            trend_alignment=trend_alignment,
            score=score
        )
    def fetch_crypto_news(self, symbol: str) -> List[NewsItem]:
        coin = symbol.split("/")[0].upper()
        simulated_news = [
            NewsItem(
                title=f"{coin} shows strong momentum in recent trading",
                sentiment="positive",
                source="CryptoNews",
                published_at=datetime.now().isoformat(),
                currencies=[coin]
            ),
            NewsItem(
                title="Regulatory concerns affect crypto market",
                sentiment="negative",
                source="Bloomberg",
                published_at=(datetime.now() - timedelta(hours=2)).isoformat(),
                currencies=["BTC", "ETH", coin]
            ),
            NewsItem(
                title="Institutional adoption continues to grow",
                sentiment="positive",
                source="CoinDesk",
                published_at=(datetime.now() - timedelta(hours=5)).isoformat(),
                currencies=["BTC", "ETH"]
            )
        ]
        return simulated_news[:5]

    def analyze_news(self, symbol: str) -> NewsAnalysis:
        news = self.fetch_crypto_news(symbol)

        if not news:
            return NewsAnalysis(
                recent_news=[],
                overall_sentiment="neutral",
                sentiment_score=0.0,
                news_count=0,
                score=1
            )

        sentiment_map = {"positive": 1, "neutral": 0, "negative": -1}
        sentiment_scores = [sentiment_map[item.sentiment] for item in news]
        avg_sentiment = sum(sentiment_scores) / len(sentiment_scores)

        if avg_sentiment >= 0.3:
            overall_sentiment = "bullish"
            score = 2
        elif avg_sentiment >= -0.3:
            overall_sentiment = "neutral"
            score = 1
        else:
            overall_sentiment = "bearish"
            score = 0

        return NewsAnalysis(
            recent_news=news,
            overall_sentiment=overall_sentiment,
            sentiment_score=round(avg_sentiment, 2),
            news_count=len(news),
            score=score
        )

    def analyze_dominance(self, df_btc: pd.DataFrame) -> DominanceAnalysis:
        recent_trend = df_btc["close"].iloc[-5:].mean()
        previous_trend = df_btc["close"].iloc[-15:-5].mean()
        simulated_dominance = 45.0

        if recent_trend > previous_trend * 1.02:
            trend = "increasing"
            interpretation = "Dominancia de BTC creciente indica flujo hacia activos grandes"
            score = 1
            simulated_dominance = 46.5
        elif recent_trend < previous_trend * 0.98:
            trend = "decreasing"
            interpretation = "Dominancia de BTC decreciente indica rotacion hacia altcoins"
            score = 0
            simulated_dominance = 43.5
        else:
            trend = "stable"
            interpretation = "Dominancia de BTC estable indica mercado consolidado"
            score = 1
            simulated_dominance = 45.0

        return DominanceAnalysis(
            btc_dominance=simulated_dominance,
            trend=trend,
            interpretation=interpretation,
            score=score
        )

    def analyze(self, symbol: str, df_asset: pd.DataFrame, df_btc: pd.DataFrame, df_eth: pd.DataFrame, timeframe: str, current_price: float) -> MacroAnalysisResponse:
        correlations = self.analyze_correlations(symbol, df_asset, df_btc, df_eth)
        news = self.analyze_news(symbol)
        dominance = self.analyze_dominance(df_btc)

        total_score = correlations.score + news.score + dominance.score
        confidence_percentage = (total_score / 5) * 100

        if confidence_percentage >= 80:
            recommendation = "STRONG_MACRO"
        elif confidence_percentage >= 60:
            recommendation = "GOOD_MACRO"
        elif confidence_percentage >= 40:
            recommendation = "NEUTRAL_MACRO"
        else:
            recommendation = "WEAK_MACRO"

        summary = f"{symbol} con {confidence_percentage:.0f}% de confluencias macro. Tendencia {correlations.trend_alignment}, sentimiento {news.overall_sentiment}."

        return MacroAnalysisResponse(
            symbol=symbol,
            timeframe=timeframe,
            current_price=current_price,
            timestamp=datetime.now().isoformat(),
            correlations=correlations,
            news=news,
            dominance=dominance,
            total_score=total_score,
            confidence_percentage=round(confidence_percentage, 2),
            recommendation=recommendation,
            summary=summary
        )