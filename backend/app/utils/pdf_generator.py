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

def generate_standalone_prescription_pdf(presc_id: str, presc_data: dict):
    file_path = f"prescription_doc_{presc_id}.pdf"
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"MedicPulse Hospital - Prescription", styles["Title"]))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>Patient:</b> {presc_data.get('patient_name', 'Unknown')}", styles["Normal"]))
    story.append(Paragraph(f"<b>Doctor:</b> {presc_data.get('doctor_name', 'Unknown')}", styles["Normal"]))
    story.append(Paragraph(f"<b>Date:</b> {presc_data.get('date', '')}", styles["Normal"]))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("<b>Medication Details:</b>", styles["Heading3"]))
    story.append(Spacer(1, 5))
    story.append(Paragraph(f"Medicine: {presc_data.get('medicine', '')} {presc_data.get('strength', '')}", styles["Normal"]))
    story.append(Paragraph(f"Dosage: {presc_data.get('dosage', '')} ({presc_data.get('frequency', '')})", styles["Normal"]))
    story.append(Paragraph(f"Duration: {presc_data.get('duration', '')}", styles["Normal"]))
    
    if presc_data.get('instructions'):
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"<b>Instructions:</b> {presc_data['instructions']}", styles["Normal"]))

    pdf = SimpleDocTemplate(file_path)
    pdf.build(story)
    return file_path
