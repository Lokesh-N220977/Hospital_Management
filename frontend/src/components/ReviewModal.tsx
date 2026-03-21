import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { reviewService } from "../services/reviewService";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onSuccess: () => void;
  existingReview?: { rating: number; comment?: string };
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  appointmentId,
  onSuccess,
  existingReview,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isReadOnly = !!existingReview;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await reviewService.createReview({
        appointment_id: appointmentId,
        rating,
        comment: comment.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rv-modal-overlay">
      <div className="rv-modal-content">
        <div className="rv-modal-header">
          <h3>{isReadOnly ? "Your Review" : "Add Review"}</h3>
          <button onClick={onClose} className="rv-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rv-modal-form">
          <div className="rv-rating-section">
            <p>How was your experience?</p>
            <div className="rv-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  className={`rv-star ${star <= rating ? "filled" : ""} ${isReadOnly ? "readonly" : ""}`}
                  onClick={() => !isReadOnly && setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="rv-comment-section">
            <label htmlFor="comment">Comment (Optional)</label>
            <textarea
              id="comment"
              placeholder="Tell us what you liked or what could be improved..."
              value={comment}
              onChange={(e) => !isReadOnly && setComment(e.target.value)}
              readOnly={isReadOnly}
              maxLength={500}
            />
          </div>

          {error && <p className="rv-error">{error}</p>}

          <div className="rv-modal-actions">
            <button type="button" onClick={onClose} className="rv-btn-secondary" style={{ width: isReadOnly ? '100%' : 'auto' }}>
              {isReadOnly ? "Close" : "Cancel"}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="rv-btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        .rv-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .rv-modal-content {
          background: white;
          width: 90%;
          max-width: 450px;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .rv-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .rv-modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }
        .rv-close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }
        .rv-close-btn:hover { color: #1f2937; }
        .rv-rating-section {
          text-align: center;
          margin-bottom: 24px;
        }
        .rv-rating-section p {
          color: #4b5563;
          margin-bottom: 12px;
          font-weight: 500;
        }
        .rv-stars {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .rv-star {
          cursor: pointer;
          color: #d1d5db;
          transition: transform 0.2s, color 0.2s;
        }
        .rv-star:hover:not(.readonly) { transform: scale(1.1); }
        .rv-star.readonly { cursor: default; }
        .rv-star.filled {
          color: #fbbf24;
          fill: #fbbf24;
        }
        .rv-comment-section {
          margin-bottom: 20px;
        }
        .rv-comment-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #4b5563;
          font-size: 14px;
        }
        .rv-comment-section textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        .rv-comment-section textarea:focus {
          outline: none;
          border-color: #6366f1;
        }
        .rv-error {
          color: #ef4444;
          font-size: 13px;
          margin-bottom: 15px;
          text-align: center;
        }
        .rv-modal-actions {
          display: flex;
          gap: 12px;
        }
        .rv-modal-actions button {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .rv-btn-secondary {
          background: #f3f4f6;
          color: #4b5563;
        }
        .rv-btn-secondary:hover { background: #e5e7eb; }
        .rv-btn-primary {
          background: #6366f1;
          color: white;
        }
        .rv-btn-primary:hover:not(:disabled) { background: #4f46e5; }
        .rv-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;
