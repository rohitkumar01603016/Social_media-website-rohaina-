import React,{useState , useEffect} from 'react'
import {toast} from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { requestJson } from "../api/client";


const Login = () => {
  let [loading, setLoading] = useState(false);
  const color = "#000000";

const nav = useNavigate();


 useEffect(()=>{
    if(localStorage.getItem("userInfo1"))
    {
         nav('/s')
    }
  },[nav])


const [data,setData] = useState({})
const handleClick = async (event) => {
      event.preventDefault();
    setLoading(true)
    if (!data.email || !data.password) {
      toast.warning('Please Fill all the Feilds',{position: toast.POSITION.TOP_LEFT})
      setLoading(false)
      return;
    }

    try{
    const Data = await requestJson('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    
    if(Data.success){
    localStorage.setItem("userInfo1", JSON.stringify(Data));
    toast.success('Successful Login',{position: toast.POSITION.TOP_LEFT,autoClose:1000})
    setLoading(false)
    nav('/s')
    }
  else 
  {
    throw Data
  }
  }catch(error){
      console.log(error)
      toast.warning(error.message || 'Login failed',{position: toast.POSITION.TOP_LEFT,autoClose:1000})
      setLoading(false)

  }
    
  }
function handleChange(event)
  {
       const {name,value} = event.target;

       setData((pre)=>{
         return {
         ...pre,
         [name]:value,

         }
       })

  }

  return (
<div className="auth-shell">
  <div className="auth-card">
    <div className="auth-brand brand-inline">
      <span className="brand-mark">R</span>
      <span className="brand-copy">
        <span className="brand-name">ROHAINA</span>
        <span className="brand-tag">social studio</span>
      </span>
    </div>

    <h1 className="auth-title">Welcome back</h1>
    <p className="auth-subtitle">
      Login to continue your feed, stories, and conversations inside ROHAINA.
    </p>
    <PulseLoader  color={color} loading={loading} size={12} />

    <form action="/login" method="POST">
      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="email">Email</label>
        <input onChange={handleChange} type="email" className="auth-input" name="email" id="email" />
      </div>
      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="password">Password</label>
        <input onChange={handleChange} type="password" className="auth-input" name="password" id="password" />
      </div>
      <button onClick={handleClick} className="auth-submit-btn">Login</button>
    </form>

    <p className="auth-footer">
      New here? <Link className="auth-link" to="/register">Create your account</Link>
    </p>
  </div>
</div>
  )
}
export default Login
