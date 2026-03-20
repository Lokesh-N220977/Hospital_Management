import AdminLayout from "../../components/layout/admin/AdminLayout"
import { Search, Filter, Calendar, Clock, Edit2, RotateCcw, Plus, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { getGlobalSchedules } from "../../services/adminService"

function DoctorSchedules() {
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const data = await getGlobalSchedules()
                setSchedules(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error("Failed to fetch schedules", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSchedules()
    }, [])

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Loader2 className="animate-spin" size={48} color="#3b82f6" />
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout>
            <div className="ad-page" style={{ animation: 'slideDownIn 0.4s ease-out' }}>
                <div className="ad-header">
                    <div className="ad-header-content">
                        <h1 className="ad-page-title">Doctor Schedules</h1>
                        <p className="ad-page-sub">Configure and monitor working hours, shift assignments, and leave balances for all medical staff.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="ad-btn-primary" style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}>
                            <RotateCcw size={16} />
                            <span>Reset Shifts</span>
                        </button>
                        <button className="ad-btn-duo">
                            <Plus size={18} />
                            <span>Mass Update</span>
                        </button>
                    </div>
                </div>

                <div className="ad-card">
                    <div className="ad-list-header">
                        <div className="ad-search-bar">
                            <Search size={18} color="#94a3b8" />
                            <input type="text" placeholder="Search by doctor name, specialty or day..." />
                        </div>
                        <div className="ad-filter-bar">
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select className="ad-filter-select">
                                    <option value="all">Status: All</option>
                                    <option value="available">Available</option>
                                    <option value="on-leave">On Leave</option>
                                </select>
                                <select className="ad-filter-select">
                                    <option value="all">Shift: All</option>
                                    <option value="morning">Morning</option>
                                    <option value="afternoon">Afternoon</option>
                                </select>
                            </div>
                            <button className="ad-btn-primary" style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}>
                                <Filter size={18} /> Filters
                            </button>
                        </div>
                    </div>

                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Medical Department</th>
                                    <th>Availability Days</th>
                                    <th>Working Shift</th>
                                    <th>Daily Slots</th>
                                    <th>Current Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.map((schedule, i) => (
                                    <tr key={schedule._id || i}>
                                        <td>
                                            <div className="ad-user-cell">
                                                <div className="ad-avatar" style={{ background: '#f1f5f9', color: '#3b82f6', border: '1px solid #e2e8f0' }}>
                                                    {(schedule.doctor_name || "D").replace('Dr. ', '').charAt(0)}
                                                </div>
                                                <div className="ad-user-info">
                                                    <span className="ad-user-name" style={{ fontSize: '0.9rem' }}>{schedule.doctor_name || "Unknown Doctor"}</span>
                                                    <span className="ad-user-sub">#{schedule._id?.slice(-6).toUpperCase() || "N/A"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="ad-user-name" style={{ fontSize: '0.85rem', color: '#64748b' }}>{schedule.specialization || "General"}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {(!schedule.working_days || schedule.working_days.length === 0) ? (
                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Not Configured</span>
                                                ) : (
                                                    schedule.working_days.map((day: string, idx: number) => (
                                                        <span key={idx} style={{ fontSize: '0.7rem', background: '#3b82f610', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>{day}</span>
                                                    ))
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="ad-user-cell" style={{ gap: '6px' }}>
                                                <Clock size={14} color="#64748b" />
                                                <span className="ad-user-name" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{schedule.working_hours || "09:00 - 17:00"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="ad-user-name" style={{ fontSize: '0.85rem', color: '#1e293b' }}>{schedule.slots_per_day || 0}</span>
                                        </td>
                                        <td>
                                            <span className={`ad-status ad-status--active`}>
                                                Reporting
                                            </span>
                                        </td>
                                        <td>
                                            <div className="ad-actions" style={{ justifyContent: 'flex-end' }}>
                                                <button className="ad-icon-btn" title="Edit Schedule" style={{ background: '#f1f5f9' }}><Edit2 size={16} /></button>
                                                <button className="ad-icon-btn" title="View Logs" style={{ background: '#f1f5f9' }}><Calendar size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default DoctorSchedules
