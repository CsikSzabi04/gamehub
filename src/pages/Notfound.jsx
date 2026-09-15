import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome } from 'react-icons/fa'
import { CgGames } from 'react-icons/cg'
import { useT } from '../i18n/index.jsx'

export default function Notfound() {
  const { t } = useT()
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center px-6 py-12 text-center">
      <Link to="/" className="mb-10 inline-flex items-center gap-2" aria-label={t('notfound.homeLabel')}>
        <CgGames className="text-3xl text-[#8b5cf6]" />
      </Link>
      <p className="gh-eyebrow mb-3">{t('notfound.eyebrow')}</p>
      <h1 className="text-[clamp(4.5rem,22vw,9rem)] font-extrabold leading-none text-white tracking-tight">404</h1>
      <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">{t('notfound.title')}</h2>
      <p className="mt-3 max-w-md text-[#a1a6b3] sm:text-lg">
        {t('notfound.text')}
      </p>
      <Link to="/" className="gh-btn gh-btn-primary !h-11 !px-5 mt-8">
        <FaHome />
        {t('notfound.backHome')}
      </Link>
    </div>
  )
}
