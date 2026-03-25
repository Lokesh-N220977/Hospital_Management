import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Phone, MapPin, CheckCircle2 } from "lucide-react"
import logo from "../../assets/logo.png"

export default function PrescriptionDocument() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // We fetch the prescription details from the backend
    const fetchPrescription = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`http://localhost:8000/api/v1/prescriptions/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (!res.ok) throw new Error("Could not load prescription data")
        const json = await res.json()
        setData(json.data || json)
      } catch (err) {
        setError("Failed to generate document")
      } finally {
        setLoading(false)
      }
    }
    fetchPrescription()
  }, [id])

  // Optional: Auto-print when loaded
  // useEffect(() => {
  //   if (data && !loading) {
  //     setTimeout(() => window.print(), 1000)
  //   }
  // }, [data, loading])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui' }}>Loading Official Document...</div>
  }

  if (error || !data) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red', fontFamily: 'system-ui' }}>{error}</div>
  }

  // Formatting helpers
  const issueDate = new Date(data.date || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  return (
    <div style={{ background: '#e2e8f0', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
      {/* Non-printable download action */}
      <style>
        {`
          @media print {
            @page { margin: 0; size: A4 portrait; }
            .no-print { display: none !important; }
            body, html { margin: 0; padding: 0; background: white; width: 100%; height: 100%; overflow: hidden; }
            .print-container { 
                box-shadow: none !important; 
                max-width: 100% !important; 
                width: 100% !important;
                height: 100vh !important;
                min-height: 100vh !important;
                border: none !important; 
                margin: 0 !important;
                page-break-inside: avoid;
            }
          }
        `}
      </style>

      <div className="no-print" style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
          <button 
             onClick={() => window.print()} 
             style={{ padding: '12px 30px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}
          >
              Download PDF / Print
          </button>
          <button 
             onClick={() => window.close()} 
             style={{ padding: '12px 30px', background: '#fff', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem' }}
          >
              Close
          </button>
      </div>

      <div className="print-container" style={{ 
        background: '#fff', 
        width: '100%', 
        maxWidth: '850px', 
        minHeight: '1000px', /* slightly shorter to avoid 2nd page on screens */
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        borderTop: '12px solid #2563eb',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        
        <div style={{ padding: '50px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '25px', marginBottom: '25px' }}>
             <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <img src={logo} alt="MedicPulse Logo" style={{ width: '100%', height: 'auto' }} />
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.8px' }}>MedicPulse Hospital</h1>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={12} /> 123 Healthcare Avenue, Medical District</p>
                  <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} /> +1 (800) 123-4567 • www.medicpulse.com</p>
                </div>
             </div>
             
             <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Dr. {data.doctor_name || "Doctor"}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{data.specialization || "Consulting Specialist"}</p>
                <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>Reg No. MD-{String(data.doctor_id || "7789").substring(0,6).toUpperCase()}</p>
             </div>
          </div>

          {/* Patient Details */}
          <div style={{ background: '#f8fafc', padding: '25px 30px', borderRadius: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px', border: '1px solid #e2e8f0' }}>
             <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Name</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{data.patient_name || "Patient"}</p>
             </div>
             <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Issue Date</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{issueDate}</p>
             </div>
             <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Prescription ID</span>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>RX-{String(data.id || data._id).substring(0,8).toUpperCase()}</p>
             </div>
          </div>

          {/* RX Symbol */}
          <div style={{ fontSize: '3rem', fontWeight: 300, color: '#cbd5e1', marginBottom: '20px', lineHeight: 1, fontFamily: 'serif' }}>
            ℞
          </div>

          {/* Medications */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
             <thead>
                <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', fontSize: '0.85rem' }}>
                   <th style={{ padding: '12px 16px', fontWeight: 800, borderRadius: '12px 0 0 12px', width: '40%' }}>Medication</th>
                   <th style={{ padding: '12px 16px', fontWeight: 800 }}>Strength</th>
                   <th style={{ padding: '12px 16px', fontWeight: 800 }}>Dosage</th>
                   <th style={{ padding: '12px 16px', fontWeight: 800, borderRadius: '0 12px 12px 0' }}>Duration</th>
                </tr>
             </thead>
             <tbody>
                {/* We map here if it was an array, but our schema is single drug per prescription historically */}
                <tr style={{ borderBottom: '2px solid #f8fafc' }}>
                   <td style={{ padding: '20px 16px', fontWeight: 800, color: '#1e293b', fontSize: '1.05rem' }}>
                      {data.medicine}
                   </td>
                   <td style={{ padding: '20px 16px', fontWeight: 700, color: '#64748b', fontSize: '0.95rem' }}>{data.strength}</td>
                   <td style={{ padding: '20px 16px', fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{data.dosage}</td>
                   <td style={{ padding: '20px 16px', fontWeight: 700, color: '#64748b', fontSize: '0.95rem' }}>{data.duration}</td>
                </tr>
             </tbody>
          </table>

          {/* Instructions */}
          {data.instructions && (
            <div style={{ marginBottom: '60px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Clinical Instructions</h3>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155', background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                   {data.instructions}
                </p>
            </div>
          )}

        </div>

        {/* Footer & Signature */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50px', right: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
           <div>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, margin: '0 0 6px 0' }}>CONFIDENTIAL MEDICAL DOCUMENT</p>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500, margin: 0 }}>This is a digitally verified prescription. Not valid without registry match.</p>
           </div>
           
           <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontFamily: "'Brush Script MT', cursive, serif", fontSize: '2.5rem', color: '#1e3a8a', opacity: 0.8, transform: 'rotate(-5deg)' }}>Dr. {data.doctor_name.split(" ")[0]}</span>
              </div>
              <div style={{ borderTop: '2px solid #cbd5e1', paddingTop: '10px' }}>
                 <p style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Authorized Signature</p>
                 <p style={{ margin: '4px 0 0 0', fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>Dr. {data.doctor_name}</p>
                 <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 700 }}><CheckCircle2 size={12} /> Digitally Signed</div>
              </div>
           </div>
        </div>

      </div>
    </div>
  )
}
