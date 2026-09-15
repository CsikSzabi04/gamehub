import { Button } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n/index.jsx'

export default function Menu({user, logout}) {
  const { t } = useT()
  return (
    <div className='menu'>
      {user ?
        <>
            {user.email}
          <Button variant='contained' onClick={logout}> {t('menu.logout')} </Button>
      </>
      : <Link to="/login"><Button variant="contained">{t('menu.login')}</Button></Link>
    }
    </div>
  )
}
