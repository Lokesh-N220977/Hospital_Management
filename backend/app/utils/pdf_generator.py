from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import os

def generate_prescription_pdf(visit_id: str, visit_data: dict):
    file_path = f"prescription_{visit_id}.pdf"
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Hospital Prescription", styles["Title"]))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"Diagnosis: {visit_data['diagnosis']}", styles["Normal"]))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Medicines:", styles["Heading3"]))

    for med in visit_data['medicines']:
        story.append(Paragraph(f"- {med}", styles["Normal"]))

    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Notes: {visit_data['notes']}", styles["Normal"]))

    pdf = SimpleDocTemplate(file_path)
    pdf.build(story)
    return file_path
