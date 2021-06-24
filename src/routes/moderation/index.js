import React, { useState } from 'react'
import Matrix from '../../Matrix'
import Requests from './Requests'
import { Loading } from '../../components/loading'

const Moderation = () => {
    const matrixClient = Matrix.getMatrixClient()
    const [loading, setLoading] = useState(false);
    const [space, setSpace] = useState('');
    const [member, setMember] = useState(false);

    const isMember = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSpace(e.target.value)
        try {
            await matrixClient.members(space + localStorage.getItem('mx_home_server')).catch(err => console.error(err)).then(res => {
                setMember(res.chunk.map(a => a.sender).includes(localStorage.getItem('mx_user_id')))
            })
            console.log(member);
        } catch (err) {
            console.error(err)
            setMember(false)
        }
        setLoading(false)
    }
    const callback = (requested) => {

    }

    return (
        <div>
            <label htmlFor="subject">Please select a space to moderate</label>
            <select id="subject" name="subject" defaultValue={''} value={space} onChange={(e) => isMember(e)}>
                <option value="" disabled={true} >Select Context</option>
                <option value="!JaLRUAZnONCuUHMPvy:" >New Media</option>
                <option value="!rorMnDkmfIThdFzwPD:" >Digitale Klasse</option>
            </select>
            {loading && <Loading />}
            {member && space && <Requests roomId={space + localStorage.getItem('mx_home_server')} />}
        </div>
    )
}
export default Moderation