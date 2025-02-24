import { Button, ButtonGroup } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

export default function Menu({user, logout}) {
  return (
    <div className='menu'>
      <ButtonGroup variant="contained" aria-label="Basic button group">
      </ButtonGroup>
      {user ?
        <>
            {user.email}
          <Button variant='contained' onClick={logout}> Logout </Button>
      </>
      : <Link to="/login"><Button variant="contained">Login</Button></Link>
    }
    </div>
  )
}
