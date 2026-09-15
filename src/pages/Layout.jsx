import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Button, Chip } from '@mui/material'
import { useT } from '../i18n/index.jsx'

export default function Layout({user, logout, auth}) {
    const { pathname } = useLocation();
    const { t } = useT();
    return (
        <>
        <div className='menu'>
        {user ?
          <div>
            <Chip label={user.email} variant='contained'></Chip>
            <Button variant='contained' onClick={logout}> {t('menu.logout')} </Button>
        </div>
        : <Link to="/login"><Button  variant={pathname=="/login" ? "outlined" : "contained"}>{t('menu.login')}</Button></Link>
      }
      </div>
      <div className='page'>
        <Outlet />
      </div>
    </>
    )
}
