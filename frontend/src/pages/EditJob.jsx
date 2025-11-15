import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { FaPlus, FaTimes } from "react-icons/fa";
import "./EmployerJobs.css";

const createInitialFormState = () => ({
  title: "",
  description: "",
  category: "",
  location: "",
  type: "Full-Time",
  salary: "",
  requirements: [""],
});

const normalizeRequirements = (requirements) => {
  if (!Array.isArray(requirements)) {
    return [""];
  }

  const cleaned = requirements
    .map((req) => (typeof req === "string" ? req : ""))
    .filter((req) => req.trim().length > 0);

  return cleaned.length > 0 ? cleaned : [""];
};

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(createInitialFormState());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setPageError("No job ID provided");
        setLoading(false);
        return;
      }

      setLoading(true);
      setPageError("");

      try {
        const response = await api.get(`/jobs/${id}`);
        const jobData = response.data?.job || response.data;

        setForm({
          title: jobData?.title || "",
          description: jobData?.description || "",
          category: jobData?.category || "",
          location: jobData?.location || "",
          type: jobData?.type || "Full-Time",
          salary: jobData?.salary || "",
          requirements: normalizeRequirements(jobData?.requirements),
        });
      } catch (error) {
        console.error("Failed to load job details", error);
        const message = error.response?.data?.message || error.message || "Failed to load job details";
        setPageError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequirementChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.requirements];
      updated[index] = value;
      return { ...prev, requirements: updated };
    });
  };

  const addRequirementField = () => {
    setForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index) => {
    setForm((prev) => {
      if (prev.requirements.length === 1) {
        return { ...prev, requirements: [""] };
      }

      const updated = prev.requirements.filter((_, idx) => idx !== index);
      return { ...prev, requirements: updated };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      const cleanRequirements = form.requirements
        .map((req) => req.trim())
        .filter((req) => req.length > 0);

      if (cleanRequirements.length === 0) {
        setFormError("Please add at least one job requirement");
        setSaving(false);
        return;
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        type: form.type,
        salary: form.salary.trim(),
        requirements: cleanRequirements,
      };

      if (!payload.title || !payload.description) {
        setFormError("Title and description are required");
        setSaving(false);
        return;
      }

      await api.put(`/jobs/${id}`, payload);

      alert("Job updated successfully!");
      navigate("/employer?tab=jobs");
    } catch (error) {
      console.error("Failed to update job", error);
      const message = error.response?.data?.message || error.message || "Failed to update job";
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading job details...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="error-container">
        <p className="error-message">{pageError}</p>
        <button className="btn btn-secondary" onClick={() => navigate("/employer?tab=jobs")}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="employer-edit-job">
      <div className="page-header">
        <button className="btn btn-link" onClick={() => navigate("/employer?tab=jobs")}>← Back to My Jobs</button>
        <h1>Edit Job</h1>
        <p>Update the details for this job posting.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="job-form">
          {formError && <div className="form-message error">{formError}</div>}

          <div className="job-form__section">
            <div className="job-form__section-header">
              <h4>Basic Details</h4>
              <p>Give candidates a clear overview of the role basics.</p>
            </div>

            <div className="job-form__grid">
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Technology, Finance"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Remote or New York, NY"
                />
              </div>

              <div className="form-group">
                <label>Job Type</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Remote">Remote</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label>Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>
            </div>
          </div>

          <div className="job-form__section">
            <div className="job-form__section-header">
              <h4>Role Description</h4>
              <p>Explain responsibilities, goals, and what success looks like.</p>
            </div>

            <div className="form-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Describe responsibilities, goals, and what success looks like in this role"
              />
            </div>
          </div>

          <div className="job-form__section">
            <div className="job-form__section-header">
              <h4>Requirements *</h4>
              <p className="job-form__requirements-intro">Add the key skills, experience, or qualifications needed.</p>
            </div>

            <div className="requirements-list">
              {form.requirements.map((requirement, index) => (
                <div key={`requirement-${index}`} className="requirement-item">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(event) => handleRequirementChange(index, event.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    required={index === 0}
                  />
                  {form.requirements.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => removeRequirement(index)}
                      aria-label="Remove requirement"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline small"
                onClick={addRequirementField}
              >
                <FaPlus /> Add Requirement
              </button>
            </div>
          </div>

          <div className="job-form__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/employer?tab=jobs")}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJob;
