import pandas as pd
from typing import List
from datetime import datetime, timedelta
from app.models.sentiment_analysis import (
    SocialSentiment, SocialAnalysis, FundingRate, FundingAnalysis,
    VolumeOIAnalysis, SentimentAnalysisResponse
)

class SentimentAnalysisModule:

    def analyze_social_sentiment(self, symbol: str) -> SocialAnalysis:
        """
        Analiza sentimiento en redes sociales

        Score (0-2 puntos):
        - 2 puntos: Sentimiento muy positivo (>0.6)
        - 1 punto: Sentimiento positivo moderado (0.2-0.6)
        - 0 puntos: Sentimiento negativo o neutral (<0.2)
        """
        coin = symbol.split("/")[0].upper()

        # Simulación de datos de redes sociales
        # En producción usar APIs: LunarCrush, Santiment, The TIE
        platforms = [
            SocialSentiment(
                platform="Twitter",
                sentiment_score=0.65,
                mentions_count=15420,
                trend="increasing"
            ),
            SocialSentiment(
                platform="Reddit",
                sentiment_score=0.58,
                mentions_count=8934,
                trend="stable"
            ),
            SocialSentiment(
                platform="Telegram",
                sentiment_score=0.72,
                mentions_count=5621,
                trend="increasing"
            )
        ]

        overall_score = sum(p.sentiment_score for p in platforms) / len(platforms)

        if overall_score >= 0.6:
            interpretation = f"Sentimiento muy positivo en redes sociales para {coin}"
            score = 2
        elif overall_score >= 0.2:
            interpretation = f"Sentimiento moderadamente positivo para {coin}"
            score = 1
        else:
            interpretation = f"Sentimiento neutral o negativo para {coin}"
            score = 0

        return SocialAnalysis(
            overall_score=round(overall_score, 2),
            platforms=platforms,
            interpretation=interpretation,
            score=score
        )

    def analyze_funding_rates(self, symbol: str) -> FundingAnalysis:
        """
        Analiza funding rates de futuros

        Score (0-1 punto):
        - 1 punto: Funding rate neutral o ligeramente positivo (0-0.1%)
        - 0 puntos: Funding rate muy alto (>0.1%) indica sobrecalentamiento
        """

        # Simulación de funding rates
        # En producción usar APIs de exchanges: Binance, Bybit, etc.
        rates = [
            FundingRate(
                exchange="Binance",
                rate=0.0085,
                next_funding_time=(datetime.now() + timedelta(hours=4)).isoformat()
            ),
            FundingRate(
                exchange="Bybit",
                rate=0.0092,
                next_funding_time=(datetime.now() + timedelta(hours=4)).isoformat()
            ),
            FundingRate(
                exchange="OKX",
                rate=0.0078,
                next_funding_time=(datetime.now() + timedelta(hours=4)).isoformat()
            )
        ]

        avg_rate = sum(r.rate for r in rates) / len(rates)
        avg_rate_pct = avg_rate * 100

        if 0 <= avg_rate_pct <= 0.05:
            interpretation = f"Funding rate neutral ({avg_rate_pct:.3f}%) - mercado equilibrado"
            score = 1
        elif avg_rate_pct > 0.05:
            interpretation = f"Funding rate alto ({avg_rate_pct:.3f}%) - posible sobrecalentamiento"
            score = 0
        else:
            interpretation = f"Funding rate negativo ({avg_rate_pct:.3f}%) - presión bajista"
            score = 0

        return FundingAnalysis(
            average_rate=round(avg_rate, 6),
            rates=rates,
            interpretation=interpretation,
            score=score
        )

    def analyze_volume_oi(self, df: pd.DataFrame, symbol: str) -> VolumeOIAnalysis:
        """
        Analiza volumen y open interest

        Score (0-1 punto):
        - 1 punto: Volumen creciente (>20% vs promedio)
        - 0 puntos: Volumen decreciente o estable
        """

        # Calcular volumen 24h
        volume_24h = df['volume'].tail(24).sum() if len(df) >= 24 else df['volume'].sum()

        # Calcular cambio de volumen
        recent_volume = df['volume'].tail(12).mean()
        previous_volume = df['volume'].tail(24).head(12).mean() if len(df) >= 24 else recent_volume

        volume_change_pct = ((recent_volume - previous_volume) / previous_volume * 100) if previous_volume > 0 else 0

        # Open Interest simulado (en producción usar API de exchanges)
        # OI solo está disponible en futuros
        simulated_oi = volume_24h * 2.5
        oi_change_pct = volume_change_pct * 0.8  # OI tiende a cambiar menos que volumen

        if volume_change_pct >= 20:
            interpretation = f"Volumen creciente significativo (+{volume_change_pct:.1f}%) - interés alto"
            score = 1
        elif volume_change_pct >= 0:
            interpretation = f"Volumen estable (+{volume_change_pct:.1f}%)"
            score = 0
        else:
            interpretation = f"Volumen decreciente ({volume_change_pct:.1f}%) - interés bajo"
            score = 0

        return VolumeOIAnalysis(
            volume_24h=round(volume_24h, 2),
            volume_change_pct=round(volume_change_pct, 2),
            open_interest=round(simulated_oi, 2),
            oi_change_pct=round(oi_change_pct, 2),
            interpretation=interpretation,
            score=score
        )

    def analyze(
        self,
        symbol: str,
        df: pd.DataFrame,
        timeframe: str,
        current_price: float
    ) -> SentimentAnalysisResponse:
        """
        Análisis completo de sentimiento

        Total: 4 puntos
        - Social sentiment: 2 puntos
        - Funding rates: 1 punto
        - Volumen y OI: 1 punto
        """

        social = self.analyze_social_sentiment(symbol)
        funding = self.analyze_funding_rates(symbol)
        volume_oi = self.analyze_volume_oi(df, symbol)

        total_score = social.score + funding.score + volume_oi.score
        confidence_percentage = (total_score / 4) * 100

        if confidence_percentage >= 75:
            recommendation = "STRONG_SENTIMENT"
        elif confidence_percentage >= 50:
            recommendation = "GOOD_SENTIMENT"
        elif confidence_percentage >= 25:
            recommendation = "NEUTRAL_SENTIMENT"
        else:
            recommendation = "WEAK_SENTIMENT"

        summary = (
            f"{symbol} con {confidence_percentage:.0f}% de confluencias de sentimiento. "
            f"Social: {social.overall_score:.2f}, Funding: {funding.average_rate:.4f}%."
        )

        return SentimentAnalysisResponse(
            symbol=symbol,
            timeframe=timeframe,
            current_price=current_price,
            timestamp=datetime.now().isoformat(),
            social=social,
            funding=funding,
            volume_oi=volume_oi,
            total_score=total_score,
            confidence_percentage=round(confidence_percentage, 2),
            recommendation=recommendation,
            summary=summary
        )