import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import StatusMessage from "../components/StatusMessage.jsx";
import { useLoginMutation, useRegisterMutation } from "../features/api/apiSlice.js";
import { setCredentials } from "../features/auth/authSlice.js";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const state = isLogin ? loginState : registerState;

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const user = await (isLogin ? login({ email: form.email, password: form.password }) : register(form)).unwrap();
    dispatch(setCredentials(user));
    navigate(user.role === "customer" ? "/events" : "/dashboard");
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Eventify</p>
        <h1>{isLogin ? "Hyr në platformë" : "Krijo llogari"}</h1>
        {!isLogin && <label>Emri<input name="name" value={form.name} onChange={updateField} required /></label>}
        <label>Email<input name="email" type="email" value={form.email} onChange={updateField} required /></label>
        <label>Password<input name="password" type="password" value={form.password} onChange={updateField} required /></label>
        <button className="button">{isLogin ? "Hyr" : "Regjistrohu"}</button>
        <StatusMessage error={state.error} />
        <p className="muted">{isLogin ? "Nuk ke llogari?" : "Ke llogari?"} <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "Regjistrohu" : "Hyr"}</Link></p>
      </form>
    </section>
  );
}
