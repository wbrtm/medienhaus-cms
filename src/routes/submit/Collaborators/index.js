import React, { useCallback, useEffect, useState } from 'react'
import Matrix from '../../../Matrix'
import Credits from './Credits'
import { Loading } from '../../../components/loading'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '../../../Auth'

const Collaborators = ({ projectSpace, members, time, startListeningToCollab }) => {
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [userSearch, setUserSearch] = useState([])
  const [collab, setCollab] = useState('')
  const [credits, setCredits] = useState([])
  const [inviting, setInviting] = useState(false)
  const [giveWritePermission, setGiveWritePermission] = useState(false)
  const [addContributionFeedback, setAddContributionFeedback] = useState('')
  const auth = useAuth()
  const profile = auth.user

  const matrixClient = Matrix.getMatrixClient()
  const { t } = useTranslation('projects')

  const checkForCredits = useCallback(async () => {
    const event = projectSpace && await matrixClient.getStateEvent(projectSpace[0].room_id, 'm.medienhaus.meta')
    setCredits(event?.credit)
  }, [matrixClient, projectSpace])

  useEffect(() => {
    checkForCredits()
  }, [checkForCredits])

  const invite = async (e) => {
    setInviting(true)
    e?.preventDefault()
    const id = collab.substring(collab.lastIndexOf(' ') + 1)
    const name = collab.substring(0, collab.lastIndexOf(' '))

    try {
      projectSpace.forEach(async (space, index) => {
        await matrixClient.invite(space.room_id, id)
          .then(() => {
            const room = matrixClient.getRoom(space.room_id)
            matrixClient.setPowerLevel(space.room_id, id, 100, room.currentState.getStateEvents('m.room.power_levels', ''))
          }).catch(console.log)

        if (index > 0) {
          try {
            await matrixClient.getSpaceSummary(space.room_id)
              .then((res) => {
                res.rooms.forEach(async (room, index) => {
                  await matrixClient.invite(room.room_id, id).catch(console.log)
                  const stateEvent = matrixClient.getRoom(projectSpace[0].room_id)
                  await matrixClient.setPowerLevel(room.room_id, id, 100, stateEvent.currentState.getStateEvents('m.room.power_levels', ''))
                    .catch(console.log)
                    .then(() => console.log('invited ' + id + ' to ' + room.name))
                }
                )
              })
          } catch (err) {
            console.log(err)
          }
        }
      })
      setAddContributionFeedback('✓ ' + name + ' was invited and needs to accept your invitation')
      time()
      setTimeout(() => {
        setAddContributionFeedback('')
        setCollab('')
      }, 3000)
      console.log('done')
    } catch (err) {
      console.error(err)
    } finally {
      setInviting(false)
    }
  }

  const addCredit = async (e) => {
    // @TODO for now adding credits as json key, needs to be discuessed
    setInviting(true)
    e.preventDefault()
    const content = await matrixClient.getStateEvent(projectSpace[0].room_id, 'm.medienhaus.meta')
    content.credit ? content.credit = [...content.credit, collab] : content.credit = [collab]
    const sendCredit = await matrixClient.sendStateEvent(projectSpace[0].room_id, 'm.medienhaus.meta', content)
    setAddContributionFeedback('event_id' in sendCredit ? '✓' : 'Something went wrong')
    checkForCredits()
    time()
    setTimeout(() => {
      setAddContributionFeedback('')
      setCollab('')
    }, 2000)
    setInviting(false)
    console.log(sendCredit)
  }

  const fetchUsers = async (e, search) => {
    e.preventDefault()
    setFetchingUsers(true)
    try {
      const users = await matrixClient.searchUserDirectory({ term: search })
      // we only update the state if the returned array has entries, to be able to check if users a matrix users or not further down in the code (otherwise the array gets set to [] as soon as you selected an option from the datalist)
      users.results.length > 0 && setUserSearch(users.results)
    } catch (err) {
      console.error('Error whhile trying to fetch users: ' + err)
    } finally {
      setFetchingUsers(false)
    }
  }

  return (
    <>
      <h3>{t('Contributors')}</h3>
      <p>{t('Did you work with other people on this project?')}</p>
      <p><Trans t={t} i18nKey="contributorsInstructions2">You can share access (for editing) to this project. The contributing editor needs an <a href="https://spaces.udk-berlin.de" rel="external nofollow noopener noreferrer" target="_blank" style={{ fontWeight: 'bold' }}>udk/spaces</a> account to edit the project.</Trans></p>
      <p><Trans t={t} i18nKey="contributorsInstructions3">You can also give credits to a contributor without an <strong>udk/spaces</strong> account, but they won’t be able to get access for editing. Just type in their name and click the <code>ADD</code> button.</Trans></p>
      <section>
        <ul>{
          members && Object.keys(members).length > 1 && Object.values(members).map((name, i) => {
            startListeningToCollab()
            return name.display_name !== profile.displayname &&
              (
                <div style={{ display: 'flex' }}>
                  {/* @TODO kicking user function */}
                  <li style={{ width: '100%' }}>⚠️ {name.display_name}</li><button disabled>x</button>
                </div>
              )
          })
        }
          {credits && credits.map((name, index) =>
            <Credits name={name} index={index} projectSpace={projectSpace[0].room_id} callback={checkForCredits} key={index} />
          )}
        </ul>

      </section>
      <div>
        <div>
          <input
            list="userSearch" id="user-datalist" name="user-datalist" placeholder="contributor name" value={collab} onChange={(e) => {
              setGiveWritePermission(false)
              fetchUsers(e, e.target.value)
              setCollab(e.target.value)
            }}
          />
        </div>
        <datalist id="userSearch">
          {userSearch.map((users, i) => {
            return <option key={i} value={users.display_name + ' ' + users.user_id} />
          })}
        </datalist>
      </div>
      {collab &&
        <div className="permissions">
          <select value={giveWritePermission} onChange={(e) => setGiveWritePermission(e.target.value)}>
            {/*
            <option value="">🚫 {collab.substring(collab.lastIndexOf(' ') + 1) || 'user'} {t('CANNOT edit the project')}</option>
            <option value disabled={!userSearch.some(user => user.user_id === collab.substring(collab.lastIndexOf(' ') + 1))}>⚠️ {collab.substring(0, collab.lastIndexOf(' ') + 1) || 'user'} {t('CAN edit the project')}</option>
            */}
            <option value="">🚫 {t('CANNOT edit the project')}</option>
            <option value disabled={!userSearch.some(user => user.user_id === collab.substring(collab.lastIndexOf(' ') + 1))}>⚠️ {t('CAN edit the project')}</option>
          </select>
          <button
            disabled={!collab || inviting || fetchingUsers} onClick={(e) => {
              giveWritePermission
                ? invite(e)
                : addCredit(e)
            }}
          >{inviting || fetchingUsers ? <Loading /> : addContributionFeedback || (giveWritePermission ? '⚠️ ADD EDITOR' : 'ADD CREDIT')}
          </button>
          {/*
          >{inviting || fetchingUsers ? <Loading /> : addContributionFeedback || (giveWritePermission ? 'ADD 🖋 ' : 'ADD 🔒')}
          */}
        </div>}
      {collab && !userSearch.some(user => user.user_id === collab.substring(collab.lastIndexOf(' ') + 1)) && <p>❗️ {t("If you're looking to give a user write permissions but can't, please make sure they have already logged in to spaces.udk-berlin.de at least once.")}</p>}
    </>
  )
}

export default Collaborators
