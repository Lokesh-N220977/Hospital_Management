from typing import List

class PriorityService:
    EMERGENCY_SYMPTOMS = ["chest pain", "breathing difficulty", "unconscious", "heavy bleeding"]
    URGENT_SYMPTOMS = ["high fever", "severe pain", "allergic reaction", "persistent vomiting"]

    @staticmethod
    def classify_priority(symptoms: List[str]) -> str:
        """
        Classifies priority based on symptoms.
        Returns: EMERGENCY, URGENT, or NORMAL.
        """
        symptoms_lower = [s.lower().strip() for s in symptoms]
        
        # Check for EMERGENCY symptoms
        for s in symptoms_lower:
            if any(e in s for e in PriorityService.EMERGENCY_SYMPTOMS):
                return "EMERGENCY"
        
        # Check for URGENT symptoms
        for s in symptoms_lower:
            if any(u in s for u in PriorityService.URGENT_SYMPTOMS):
                return "URGENT"
        
        return "NORMAL"
