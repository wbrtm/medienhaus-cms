import React, { useEffect, useState } from 'react'
import Requests from './components/Requests'
import { Loading } from '../../components/loading'
import useJoinedSpaces from '../../components/matrix_joined_spaces'
import Matrix from '../../Matrix'
import { MatrixEvent } from 'matrix-js-sdk'
import { useTranslation } from 'react-i18next'
import InviteUserToSpace from './components/InviteUserToSpace'
import RightsManagement from './components/RightsManagement'
import ManageContexts from '../admin/components/ManageContexts'
import RemoveContent from './components/RemoveContent'

import SimpleButton from '../../components/medienhausUI/simpleButton'

import config from '../../config.json'

const Moderate = () => {
  const { joinedSpaces, spacesErr, fetchSpaces } = useJoinedSpaces(false)
  const [moderationRooms, setModerationRooms] = useState()
  const [userSearch, setUserSearch] = useState([])
  const [selection, setSelection] = useState('')
  const [fetching, setFetching] = useState(false)
  const matrixClient = Matrix.getMatrixClient()

  const { t } = useTranslation()
  useEffect(() => {
    if (joinedSpaces) {
      const typesOfSpaces = config.medienhaus?.context || 'context'
      // check to see if a user has joined a room with the specific content type and is moderator or admin (at least power level 50)
      const filteredRooms = joinedSpaces.filter(space => typesOfSpaces.includes(space.meta.type) && space.powerLevel > 49)
      setModerationRooms(filteredRooms)
    }
  }, [joinedSpaces])

  const setPower = async (roomId, userId, level) => {
    console.log('changing power level for ' + userId)
    const stateEvent = await matrixClient.getStateEvent(roomId, 'm.room.power_levels', '')
    const powerEvent = new MatrixEvent({
      type: 'm.room.power_levels',
      content: stateEvent
    })
    return matrixClient.setPowerLevel(roomId, userId, level, powerEvent)
  }
  const fetchUsers = async (e, search) => {
    e.preventDefault()
    setFetching(true)
    try {
      const users = await matrixClient.searchUserDirectory({ term: search })
      // we only update the state if the returned array has entries, to be able to check if users a matrix users or not further down in the code (otherwise the array gets set to [] as soon as you selected an option from the datalist)
      users.results.length > 0 && setUserSearch(users.results)
    } catch (err) {
      console.error('Error whhile trying to fetch users: ' + err)
    } finally {
      setFetching(false)
    }
  }
  const GetRequestPerRoom = ({ request }) => {
    const room = matrixClient.getRoom(request.room_id)
    // console.log(Object.values(room.currentState.members))
    const knockingUsers = Object.values(room?.currentState.members).filter(user => user.membership === 'knock')
    // @TODO delete users from array after accepting/rejecting

    if (knockingUsers.length < 1) return null

    return knockingUsers.map((user, index) => {
      return (
        <React.Fragment key={request.name + index}>
          <h3>{request.name}</h3>
          <Requests roomId={request.room_id} roomName={request.name} userId={user.userId} userName={user.name} matrixClient={matrixClient} key={index} />
        </React.Fragment>
      )
    })
  }

  const renderSelection = () => {
    switch (selection) {
      case 'invite':
        return config.medienhaus?.sites?.moderate?.invite && <> <InviteUserToSpace matrixClient={matrixClient} moderationRooms={moderationRooms} setPower={setPower} fetchUsers={fetchUsers} fetching={fetching} userSearch={userSearch} /></>
      case 'rightsManagement':
        return config.medienhaus?.sites?.moderate?.rightsManagement && <> <RightsManagement matrixClient={matrixClient} moderationRooms={moderationRooms} setPower={setPower} fetchUsers={fetchUsers} fetching={fetching} userSearch={userSearch} /></>
      case 'manageContexts':
        return config.medienhaus?.sites?.moderate?.manageContexts && <><ManageContexts matrixClient={matrixClient} /></>
      case 'removeContent':
        return config.medienhaus?.sites?.moderate?.removeContent && <><RemoveContent matrixClient={matrixClient} moderationRooms={moderationRooms} loading={fetching} /></>
      default:
        return (
          config.medienhaus?.sites?.moderate?.accept &&
            <>
              <h2>{t('Accept user requests')}</h2>
              {moderationRooms.length > 0
                ? <>
                  <section className="requests">
                    {moderationRooms.map((request, index) => <React.Fragment key={request.name}>
                      <GetRequestPerRoom request={request} key={index} />
                    </React.Fragment>)}
                  </section>
                </>
                : (
                  <div>
                    {t('Looks like you are not moderating any spaces.')}
                  </div>)}
            </>
        )
    }
  }

  if (fetchSpaces || !matrixClient.isInitialSyncComplete()) return <Loading />
  if (spacesErr) return <p>{spacesErr}</p>
  return (
    <>
      <section className="request">
        {Object.keys(config?.medienhaus?.sites?.moderate).map((value, index) => {
          return <SimpleButton width="auto" disabled={value === selection} value={value} key={value} onClick={(e) => setSelection(e.target.value)}>{value.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</SimpleButton>
        })}
      </section>

      {renderSelection()}
    </>
  )
}

export default Moderate
