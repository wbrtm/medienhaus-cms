import React from 'react'
import i18n from 'i18next'
import { NavLink, useHistory } from 'react-router-dom'
import { useAuth } from '../../Auth'

const Nav = () => {
  const auth = useAuth()
  const history = useHistory()
  const changeLanguage = event => {
    const languageCode = event.target.value
    localStorage.setItem('cr_lang', languageCode)
    i18n.changeLanguage(languageCode)
  }

  if (auth.user === null) {
    return null
  }

  return (
    <>
      <nav>
        <div>
          <div>
            {auth.user
              ? (
                <button onClick={() => auth.signout(() => history.push('/'))}>logout</button>
                // <a href={process.env.REACT_APP_MATRIX_BASE_URL + '/classroom'} rel="nofollow noopener noreferrer" target="_self">/classroom&nbsp;-&gt;</a>
                )
              : (
                <NavLink activeclassname="active" to="/login">/login</NavLink>
                )}
          </div>
          {auth.user && (
            <>
              <div>
                <NavLink activeclassname="active" to="/projects">/projects</NavLink>
                <NavLink activeclassname="active" to="/support">/support</NavLink>
                {/* <NavLink activeclassname="active" to="/tools">/tools</NavLink>  only for dev */}
                <NavLink activeclassname="active" to="/moderation">/moderation</NavLink>
                {
                  // <NavLink activeclassname="active" to="/admin">/admin</NavLink>}
                  // matrixClient.isSynapseAdministrator() ?? console.log('with great power comes great responsibility')
                }
              </div>
              <div>
                <a href="https://meetings.udk-berlin.de" rel="external nofollow noopener noreferrer" target="_blank">/meet</a>
                <a href="https://write.medienhaus.udk-berlin.de" rel="external nofollow noopener noreferrer" target="_blank">/write</a>
                <a href="https://stream.medienhaus.udk-berlin.de" rel="external nofollow noopener noreferrer" target="_blank">/stream</a>
              </div>
            </>
          )}
        </div>
      </nav>
      <select defaultValue={i18n.language} onChange={changeLanguage}>
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
    </>
  )
}

export default Nav
