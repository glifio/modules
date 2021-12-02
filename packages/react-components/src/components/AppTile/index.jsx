import React from 'react'
import PropTypes from 'prop-types'
import './index.css'

export default function AppTile({
  description,
  oldTileName,
  imgSrc,
  href,
  title
}) {
  return (
    <a href={href} target='_blank' rel='noreferrer' className='appTile small'>
      <div className='appTileContent'>
        <header className='appTileHeader align-right'>
          <div className='appTileName'>
            <h2>{title}</h2>
            {oldTileName && <h3 className='appTileOldName'>{oldTileName}</h3>}
          </div>
        </header>
        <img src={imgSrc} className='appTileBackground' alt='' />
      </div>
      <div className='appTileHover'>{description}</div>
    </a>
  )
}

AppTile.defaultProps = {
  oldTileName: ''
}

AppTile.propTypes = {
  description: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  oldTileName: PropTypes.string
}
