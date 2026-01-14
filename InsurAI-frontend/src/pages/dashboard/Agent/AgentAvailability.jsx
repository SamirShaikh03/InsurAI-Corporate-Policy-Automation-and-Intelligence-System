import React, { useState } from "react";
import "./AgentAvailability.css";

export default function AgentAvailability({
  agentName,
  availability,
  toggleAvailability,
  futureFrom,
  setFutureFrom,
  futureTo,
  setFutureTo,
  scheduleFutureAvailability,
}) {
  const [scheduledSlots, setScheduledSlots] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSchedule = () => {
    setError("");
    setSuccess("");

    if (!futureFrom || !futureTo) {
      setError("⚠️ Please select both start and end date/time.");
      return;
    }
    if (new Date(futureFrom) >= new Date(futureTo)) {
      setError("⚠️ End time must be after start time.");
      return;
    }

    const newSlot = { from: futureFrom, to: futureTo };
    setScheduledSlots([...scheduledSlots, newSlot]);
    scheduleFutureAvailability(newSlot);

    setFutureFrom("");
    setFutureTo("");
    setSuccess("✅ Future availability scheduled successfully!");
  };

  const handleRemoveSlot = (index) => {
    const updatedSlots = scheduledSlots.filter((_, i) => i !== index);
    setScheduledSlots(updatedSlots);
    setSuccess("🗑️ Scheduled slot removed.");
  };

  return (
    <div className="agent-availability">
      <div className="avail-header">
        <h3>Availability Settings ({agentName})</h3>
        <p>Configure your availability status and schedule future time slots</p>
      </div>
      <div className="avail-card">
        <div className="avail-card-header">
          <i className="bi bi-person-check"></i>
          <h5>Set Your Availability</h5>
        </div>
        <div className="avail-card-body">
          {/* Alerts */}
          {success && (
            <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4">
              <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              <div className="flex-grow-1">{success}</div>
              <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div className="flex-grow-1">{error}</div>
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          <div className="info-banner">
            <i className="bi bi-info-circle"></i>
            <p>When you're unavailable, employees will see that you're not accepting new queries at the moment.</p>
          </div>

          {/* Current Availability Toggle */}
          <div className="toggle-section">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="availabilityToggle"
                checked={availability}
                onChange={toggleAvailability}
              />
            </div>
            <label className="toggle-label" htmlFor="availabilityToggle">
              I am currently available for employee queries
            </label>
          </div>

          <div className={`status-box ${availability ? "available" : "unavailable"}`}>
            <h6>Current Status</h6>
            <span className={`status-badge ${availability ? "available" : "unavailable"}`}>
              <i className={`bi ${availability ? "bi-check-circle-fill" : "bi-pause-circle-fill"}`}></i>
              {availability
                ? "Available - Employees can contact you"
                : "Unavailable - Not accepting new queries"}
            </span>
          </div>

          {/* Schedule Future Availability */}
          <div className="schedule-section">
            <h6>
              <i className="bi bi-calendar-plus"></i>
              Schedule Future Availability
            </h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">From</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={futureFrom}
                  onChange={(e) => setFutureFrom(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">To</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={futureTo}
                  onChange={(e) => setFutureTo(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-success" onClick={handleSchedule}>
              <i className="bi bi-calendar-check"></i> Schedule Availability
            </button>
          </div>

          {/* Scheduled Slots Table */}
          {scheduledSlots.length > 0 && (
            <div className="slots-section">
              <h6>
                <i className="bi bi-clock-history"></i> Upcoming Scheduled Slots
              </h6>
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>From</th>
                      <th>To</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduledSlots.map((slot, index) => (
                      <tr key={index}>
                        <td>{new Date(slot.from).toLocaleString()}</td>
                        <td>{new Date(slot.to).toLocaleString()}</td>
                        <td>
                          <span className="badge bg-primary">Scheduled</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveSlot(index)}
                          >
                            <i className="bi bi-trash me-1"></i> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
