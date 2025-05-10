import './Navbar.css'
import logo from '../../assets/logo.png'
import downarrow from '../../assets/downarrow.png'
import user from '../../assets/user.png'

const Navbar = () => {
  return (
    <>
      <div className='nav-bar home'>
        <div className="logo">
          <img src={logo} alt="logo" className='logo-img' />
          <h2>2D-3D CAD</h2>
        </div>
        <div className="user">
          <img src={user} alt="user img" className='user-img' />
          <img src={downarrow} alt="dropdown icon" className='dropdown-icon' />
          <div className="dp-home">
            <p>Account Details</p>
            <p>Help</p>
            <p>Sign out</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar