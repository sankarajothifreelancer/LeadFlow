import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('sankarajothifreelancer@gmail.com');
  const [password, setPassword] = useState('nobi@2406');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.post('/auth/login', { email, password });
      await onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pin-page-wrapper">
      {/* 
        Fluid Organic Waves on screen edges matching the Pinterest reference image
        - Top-left wave swelling from the top/left border
        - Bottom-left wave swelling from the bottom/left border
        - Right wave swelling from the right border
        - Strictly NO 4-corner circular bubbles!
      */}
      <svg className="bg-fluid-wave wave-top-left" viewBox="0 0 350 420" preserveAspectRatio="none">
        <path
          d="M 0,0 L 280,0 C 330,70 350,150 320,220 C 280,310 160,335 0,350 Z"
          fill="#071952"
        />
      </svg>

      <svg className="bg-fluid-wave wave-bottom-left" viewBox="0 0 280 320" preserveAspectRatio="none">
        <path
          d="M 0,160 C 110,150 190,210 240,320 L 0,320 Z"
          fill="#071952"
        />
      </svg>

      <svg className="bg-fluid-wave wave-right" viewBox="0 0 280 720" preserveAspectRatio="none">
        <path
          d="M 280,80 C 150,150 70,270 95,400 C 120,530 195,610 280,680 Z"
          fill="#071952"
        />
      </svg>

      {/* Main Pinterest-Style Floating Card */}
      <div className="pin-center-card">
        {/* Navy Gradient Background of the Card */}
        <div className="pin-card-navy-bg" />

        {/* 
          White Scalloped Cloud Silhouette SVG overlay inside the card
          - Covers the left column completely (white background for form)
          - Scallops across the right column as an organic cloud band containing "Welcome Back!"
          - Leaves top-right and bottom-right exposing the rich Navy card background
        */}
        <svg
          className="pin-cloud-overlay"
          viewBox="0 0 900 520"
          preserveAspectRatio="none"
        >
          <path
            d="
              M 0,0
              L 360,0
              C 395,22 430,22 460,8
              C 495,32 540,32 575,10
              C 615,50 670,52 710,25
              C 755,75 810,78 850,55
              C 875,75 890,95 900,120
              L 900,375
              C 870,395 835,385 805,415
              C 765,455 710,450 670,410
              C 625,465 570,460 535,420
              C 490,475 435,465 400,425
              C 365,485 305,485 270,520
              L 0,520
              Z
            "
            fill="#FFFFFF"
          />
        </svg>

        {/* Card Content Grid Layer (Sitting on top of the white cloud) */}
        <div className="pin-card-content">
          {/* Left: Form Area */}
          <div className="pin-left-col">
            <img src="/logo.png" alt="LeadFlow" className="pin-brand-logo" />
            <h1 className="pin-hello-title">Hello!</h1>
            <p className="pin-hello-sub">Sign in to your account</p>

            {error && (
              <div className="pin-error-box">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="pin-form">
              {/* E-mail Pill */}
              <div className="pin-pill-field">
                <div className="pin-pill-icon">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="E-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pin-pill-input"
                />
              </div>

              {/* Password Pill */}
              <div className="pin-pill-field">
                <div className="pin-pill-icon">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pin-pill-input"
                />
                <button
                  type="button"
                  className="pin-eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="pin-row-options">
                <label className="pin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <span className="pin-forgot-link">Private access</span>
              </div>

              {/* Centered Sign In Button */}
              <div className="pin-btn-container">
                <button
                  type="submit"
                  disabled={busy}
                  className="pin-submit-button"
                >
                  {busy ? 'SIGNING IN…' : 'SIGN IN'}
                </button>
              </div>

              <div className="pin-create-footer">
                <span>LeadFlow 3-Member Workspace</span>
              </div>
            </form>
          </div>

          {/* Right: Welcome Back Text Area */}
          <div className="pin-right-col">
            <h2 className="pin-welcome-title">Welcome Back!</h2>
            <p className="pin-welcome-desc">
              Private lead conversion and relationship CRM. Coordinate client calls, manage active delivery milestones, and track revenue seamlessly across your team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
