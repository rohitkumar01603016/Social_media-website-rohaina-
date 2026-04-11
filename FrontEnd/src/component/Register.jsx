import React ,{useState,useEffect}from 'react'
import {toast} from 'react-toastify';
import { useNavigate } from "react-router-dom";
import PulseLoader from "react-spinners/PulseLoader";
import { Link } from 'react-router-dom';
import { requestJson } from "../api/client";

const Register = () => {
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

  async function handleClick(event){
    //console.log(data);
    event.preventDefault();
    setLoading(true)

    if (!data.name || !data.password|| !data.email ||!data.password2) {
      toast.warning('Please Fill all the Feilds',{position: toast.POSITION.TOP_LEFT})
          setLoading(false)
      return;
    }

   try {
    const Data = await requestJson('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    });

    if(!Data.error){
      toast.success('Successful Register',{position: toast.POSITION.TOP_LEFT,autoClose:1000})
      setLoading(false)
      nav('/login')
    }
    else 
    {
      toast.warning(Data.error,{position: toast.POSITION.TOP_LEFT,autoClose:1000})
      setLoading(false)
    }
   } catch (error) {
    console.log(error)
    toast.warning(error.message || 'Register failed',{position: toast.POSITION.TOP_LEFT,autoClose:1000})
    setLoading(false)
   }
    
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

    <h1 className="auth-title">Create your account</h1>
    <p className="auth-subtitle">
      Join ROHAINA to start posting, sharing story moments, and chatting with your people.
    </p>
    <PulseLoader  color={color} loading={loading} size={12} />

    <form>
      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="name">Name</label>
        <input onChange={handleChange} type="text" className="auth-input" name="name" id="name"/>
      </div>
      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="email">Email</label>
        <input onChange={handleChange} type="email" className="auth-input" name="email" id="email"/>
      </div>
      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="password">Password</label>
        <input onChange={handleChange} type="password" className="auth-input" name="password" id="password"/>
      </div>
      <div className="auth-form-group">
        <label className="auth-form-label" htmlFor="password2">Confirm password</label>
        <input onChange={handleChange} type="password" className="auth-input" name="password2" id="password2"/>
      </div>
      <button onClick={handleClick} className="auth-submit-btn">Register</button>
    </form>

    <p className="auth-footer">
      Already have an account? <Link className="auth-link" to="/login">Login here</Link>
    </p>
  </div>
</div>
  )
}
export default Register
