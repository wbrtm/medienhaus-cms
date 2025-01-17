import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useAuth } from '../../Auth'
import { isFunction } from 'lodash/lang'
import LanguageSelector from '../LanguageSelector'
import useJoinedSpaces from '../matrix_joined_spaces'
import Matrix from '../../Matrix'
import config from '../../config.json'

const Nav = () => {
  const auth = useAuth()
  const history = useHistory()
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const [isModeratingSpaces, setIsModeratingSpaces] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [knockAmount, setKnockAmount] = useState(0)
  const [invites, setInvites] = useState([])
  const { joinedSpaces, spacesErr } = useJoinedSpaces(false)
  const matrixClient = Matrix.getMatrixClient()

  useEffect(() => {
    if (spacesErr) console.log(spacesErr)
    if (joinedSpaces && auth.user) {
      const typesOfSpaces = config.medienhaus?.context || ['context']
      // To "moderate" a space it must have one of the given types and we must be at least power level 50
      const moderatingSpaces = joinedSpaces.filter(space => typesOfSpaces.includes(space.meta.template) && space.powerLevel >= 50)
      // If we are not moderating any spaces we can cancel the rest here ...
      if (moderatingSpaces.length < 1) return

      // ... but if we -are- indeed moderating at least one space, we want to find out if there are any pending knocks
      setIsModeratingSpaces(true)

      async function getAmountOfPendingKnocks () {
        const fullRoomObjectForModeratingSpaces = await Promise.all(moderatingSpaces.map(async (space) => await matrixClient.getRoom(space.room_id)))

        const pendingKnocks = []
        // For each space we're moderating...
        fullRoomObjectForModeratingSpaces.forEach(room => {
          // ... go through every room member...
          Object.values(room.currentState.members).forEach(user => {
            // .. and if they're currently knocking add them to the pendingKnocks array.
            if (user.membership === 'knock') pendingKnocks.push(user)
          })
        })
        setKnockAmount(pendingKnocks.length)
      }

      getAmountOfPendingKnocks()
    }
  }, [joinedSpaces, auth.user, matrixClient, spacesErr])

  useEffect(() => {
    async function checkRoomForPossibleInvite (room) {
      // Types of spaces for which we want to count invites for
      const contextTemplates = config.medienhaus?.context && config.medienhaus?.context
      const itemTemplates = config.medienhaus?.item && Object.keys(config.medienhaus?.item)
      const typesOfTemplates = contextTemplates?.concat(itemTemplates)
      // Ignore if this is not a space
      if (room.getType() !== 'm.space') return
      // Ignore if this is not a "context" or "item"
      const metaEvent = await matrixClient.getStateEvent(room.roomId, 'dev.medienhaus.meta').catch(() => { })
      // ignore if the room doesn't have a medienhaus meta event
      if (!metaEvent) return
      // ignore if there are templates specified within config.json but the room does not follow one of them
      if (typesOfTemplates && !typesOfTemplates.includes(metaEvent.template)) return
      // Ignore if this is not an invitation (getMyMembership() only works correctly after calling _loadMembersFromServer())
      await room.loadMembersFromServer().catch(console.error)
      // At this point we're sure that the room we're checking for is either
      if (room.getMyMembership() === 'invite') {
        // ... 1. an invitation we want to display, so we add it to the state, or ...
        setInvites((invites) => [...invites, room.roomId])
      } else {
        // ... 2. a room that the membership has changed for to something other than "invite", so we do -not- want it to be in the state in case it's there right now:
        setInvites(invites => invites.filter(invite => invite !== room.roomId))
      }
    }

    // On page load: Get current set of invitations
    const allRooms = matrixClient.getRooms()
    allRooms.forEach(checkRoomForPossibleInvite)

    // While on the page: Listen for incoming room events to add possibly new invitations to the state
    matrixClient.on('Room.myMembership', checkRoomForPossibleInvite)
    // When navigating away from /content we want to stop listening for those room events again
    return () => {
      matrixClient.removeListener('Room.myMembership', checkRoomForPossibleInvite)
    }
  }, [matrixClient])

  useEffect(() => {
    if (!auth.user || auth.user === null) return

    const checkAdminPriviliges = async () => {
      setIsAdmin(await matrixClient.isSynapseAdministrator().catch((error) => {
        if (error.errcode === 'M_UNKNOWN_TOKEN') auth.signout(() => history.push('/login'))
      }
      ))
    }
    matrixClient && checkAdminPriviliges()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrixClient, auth.user])

  if (auth.user === null) {
    return null
  }

  const NavLink = ({ to, onClick, children, className }) => {
    return (
      <Link
        to={to}
        className={className}
        onClick={() => {
          setIsNavigationOpen(false)
          if (onClick && isFunction(onClick)) onClick()
        }}
      >
        {children}
      </Link>
    )
  }

  return (
    <>
      <header>
        <NavLink to="/">
          <h1>{process.env.REACT_APP_APP_TITLE}</h1>
        </NavLink>
        {auth.user
          ? <button type="button" className={isNavigationOpen ? 'close' : 'open'} onClick={() => setIsNavigationOpen(!isNavigationOpen)}>{isNavigationOpen ? '×' : '|||'}</button>
          : <NavLink to="/login">/login</NavLink>}
      </header>
      <nav className={`${(isNavigationOpen && 'active')}`}>
        <div>
          <div>
            {auth.user
              ? <NavLink to="/" onClick={() => auth.signout(() => history.push('/'))}>/logout</NavLink>
              : <NavLink to="/login">/login</NavLink>}
          </div>
          {auth.user && (
            <>
              <div>
                <NavLink to="/create">/create</NavLink>
                <NavLink to="/content">/content <sup className={`notification ${invites.length > 0 ? '' : 'hidden'}`}>●</sup></NavLink>
              </div>
              <div>
                {config.medienhaus?.sites?.account && <NavLink to="/account">/account</NavLink>}
                {config.medienhaus?.sites.moderate && <NavLink to="/moderate" className={!isModeratingSpaces ? 'disabled' : ''}>/moderate<sup className={`notification ${knockAmount < 1 ? 'hidden' : ''}`}>●</sup></NavLink>}
                {isAdmin && <NavLink to="/admin">/admin</NavLink>}
              </div>
              {(config.medienhaus?.sites.feedback || config.medienhaus?.sites?.support || config.medienhaus?.sites?.request) &&
                <div>
                  {config.medienhaus?.sites?.feedback && <NavLink to="/feedback">/feedback</NavLink>}
                  {config.medienhaus?.sites?.support && <NavLink to="/support">/support</NavLink>}
                  {config.medienhaus?.sites?.request && <NavLink to="/request">/request</NavLink>}
                </div>}
              {config.medienhaus?.pages && <div>
                {Object.keys(config.medienhaus.pages).map(key => <NavLink key={key} to={'/pages/' + encodeURI(key)}>{'/' + config.medienhaus.pages[key].label}</NavLink>)}
              </div>}
            </>
          )}
        </div>
        <LanguageSelector />
      </nav>
    </>
  )
}

export default Nav
