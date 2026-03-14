from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_prescription(file_path, patient, doctor, diagnosis):

    c = canvas.Canvas(file_path, pagesize=letter)

    c.drawString(100, 750, f"Doctor: {doctor}")
    c.drawString(100, 720, f"Patient: {patient}")
    c.drawString(100, 690, f"Diagnosis: {diagnosis}")

    c.save()