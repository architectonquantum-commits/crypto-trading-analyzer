from datetime import datetime
from typing import List, Dict
from app.models.signal_validator import (
    ManualSignalRequest, ModuleScores, ValidationResult, SignalValidationResponse
)

class SignalValidatorService:

    def generate_validation(
        self,
        signal: ManualSignalRequest,
        current_price: float,
        scores: ModuleScores,
        detailed_analysis: Dict
    ) -> ValidationResult:
        """Genera recomendación final basada en scores"""

        reasons = []
        warnings = []

        tech = scores.technical
        struct = scores.structure
        risk = scores.risk
        macro = scores.macro
        sent = scores.sentiment

        # Analizar cada módulo
        if tech >= 5:
            reasons.append(f"Análisis técnico fuerte ({tech}/7)")
        elif tech <= 2:
            warnings.append(f"Análisis técnico débil ({tech}/7)")

        if struct >= 4:
            reasons.append(f"Estructura favorable ({struct}/5)")
        elif struct <= 2:
            warnings.append(f"Estructura desfavorable ({struct}/5)")

        if risk >= 3:
            reasons.append(f"Gestión de riesgo adecuada ({risk}/4)")
        else:
            warnings.append(f"Gestión de riesgo deficiente ({risk}/4)")

        if macro >= 4:
            reasons.append(f"Contexto macro favorable ({macro}/5)")
        elif macro <= 2:
            warnings.append(f"Contexto macro desfavorable ({macro}/5)")

        if sent >= 3:
            reasons.append(f"Sentimiento positivo ({sent}/4)")
        elif sent <= 1:
            warnings.append(f"Sentimiento negativo ({sent}/4)")

        # Verificar precio entrada vs actual
        price_diff_pct = abs((signal.entry_price - current_price) / current_price * 100)
        if price_diff_pct > 5:
            warnings.append(
                f"Precio actual ({current_price:.2f}) difiere {price_diff_pct:.1f}% "
                f"del entry ({signal.entry_price:.2f})"
            )

        # Recomendación según confluencias
        pct = scores.percentage

        if pct >= 85:
            recommendation = "OPERAR"
            confidence = "MUY ALTA"
            should_trade = True
        elif pct >= 70:
            recommendation = "OPERAR"
            confidence = "ALTA"
            should_trade = True
        elif pct >= 55:
            recommendation = "CONSIDERAR"
            confidence = "MEDIA"
            should_trade = False
            warnings.append("Confluencias medias - esperar mejor setup")
        else:
            recommendation = "EVITAR"
            confidence = "BAJA"
            should_trade = False
            warnings.append("Confluencias bajas - NO operar")

        return ValidationResult(
            recommendation=recommendation,
            confidence_level=confidence,
            should_trade=should_trade,
            reasons=reasons,
            warnings=warnings
        )

    def validate_signal(
        self,
        signal: ManualSignalRequest,
        current_price: float,
        tech_score: int,
        struct_score: int,
        risk_score: int,
        macro_score: int,
        sent_score: int,
        detailed_analysis: Dict
    ) -> SignalValidationResponse:
        """Valida señal combinando todos los módulos"""

        scores = ModuleScores(
            technical=tech_score,
            structure=struct_score,
            risk=risk_score,
            macro=macro_score,
            sentiment=sent_score,
            total=tech_score + struct_score + risk_score + macro_score + sent_score,
            percentage=0.0
        )

        scores.percentage = round((scores.total / scores.max_possible) * 100, 2)

        validation = self.generate_validation(signal, current_price, scores, detailed_analysis)

        summary = (
            f"Señal {signal.direction} en {signal.symbol} con {scores.percentage:.0f}% "
            f"de confluencias ({scores.total}/{scores.max_possible} puntos). "
            f"Recomendación: {validation.recommendation}. "
            f"Confianza: {validation.confidence_level}."
        )

        return SignalValidationResponse(
            signal_input=signal,
            current_price=current_price,
            timestamp=datetime.now().isoformat(),
            scores=scores,
            validation=validation,
            summary=summary,
            detailed_analysis=detailed_analysis
        )