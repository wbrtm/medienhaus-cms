import React, { useState } from 'react'
import { Loading } from '../../components/loading'

const FileUpload = (props) => {
  const [selectedFile, setSelectedFile] = useState()
  const [fileName, setFileName] = useState('')
  const [author, setAuthor] = useState('')
  const [license, setLicense] = useState('')
  const [alttext, setAlttext] = useState('')
  const size = props.fileType === 'image' ? 5000000 : 25000000

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0])
    console.log(selectedFile)
    setFileName(event.target.files[0].name)
  }

  return (
    <>
      <input className="browse" type="file" name="browse" onChange={changeHandler} disabled={props.fileType === '' || false} />
      {selectedFile && (
        <>
          <input type="text" placeholder="Author" onChange={(e) => setAuthor(e.target.value)} />
          <select id="license" name="license" defaultValue={''} value={license} onChange={(e) => setLicense(e.target.value)}>
            <option value="" disabled={true}>-- select license or rights statement --</option>
            <optgroup label="Creative Commons Licenses">
              <option value="cc0">CC0 1.0</option>
              <option value="cc-by">CC BY 4.0</option>
              <option value="cc-by-sa">CC BY-SA 4.0</option>
              <option value="cc-by-nc">CC BY-NC 4.0</option>
              <option value="cc-by-nc-sa">CC BY-NC-SA 4.0</option>
              <option value="cc-by-nd">CC BY-ND 4.0</option>
              <option value="cc-by-nc-nd">CC BY-NC-ND 4.0</option>
            </optgroup>
            <optgroup label="Rights Statements">
              <option value="rs-inc">In Copyright</option>
            </optgroup>
          </select>
          <div id="cc0" className="license-info">
            <p>CC0 (aka CC Zero) is a public dedication tool, which allows creators to give up their copyright and put their works into the worldwide public domain. CC0 allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, with no conditions.</p>
            <p>CC BY includes the following elements:</p>
          </div>
          <div id="cc-by" className="license-info">
            <p>This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use.</p>
            <p>CC BY includes the following elements:</p>
            <ul>
              <li>BY: Credit must be given to the creator</li>
            </ul>
          </div>
          <div id="cc-by-sa" className="license-info">
            <p>This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use. If you remix, adapt, or build upon the material, you must license the modified material under identical terms.</p>
            <p>CC BY-SA includes the following elements:</p>
            <ul>
              <li>BY: Credit must be given to the creator</li>
              <li>SA: Adaptations must be shared under the same terms</li>
            </ul>
          </div>
          <div id="cc-by-nc" className="license-info">
            <p>This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator.</p>
            <p>CC BY-NC includes the following elements:</p>
            <ul>
              <li>BY: Credit must be given to the creator</li>
              <li>NC: Only noncommercial uses of the work are permitted</li>
            </ul>
          </div>
          <div id="cc-by-nc-sa" className="license-info">
            <p>This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format for noncommercial purposes only, and only so long as attribution is given to the creator. If you remix, adapt, or build upon the material, you must license the modified material under identical terms.</p>
            <p>CC BY-NC-SA includes the following elements:</p>
            <ul>
              <li>BY: Credit must be given to the creator</li>
              <li>NC: Only noncommercial uses of the work are permitted</li>
              <li>SA: Adaptations must be shared under the same terms</li>
            </ul>
          </div>
          <div id="cc-by-nd" className="license-info">
            <p>This license allows reusers to copy and distribute the material in any medium or format in unadapted form only, and only so long as attribution is given to the creator. The license allows for commercial use.</p>
            <p>CC BY-ND includes the following elements:</p>
            <ul>
              <li>BY: Credit must be given to the creator</li>
              <li>ND: No derivatives or adaptations of the work are permitted</li>
            </ul>
          </div>
          <div id="cc-by-nc-nd" className="license-info">
            <p>This license allows reusers to copy and distribute the material in any medium or format in unadapted form only, for noncommercial purposes only, and only so long as attribution is given to the creator.</p>
            <p>CC BY-NC-ND includes the following elements:</p>
            <ul>
              <li>BY: Credit must be given to the creator</li>
              <li>NC: Only noncommercial uses of the work are permitted</li>
              <li>ND: No derivatives or adaptations of the work are permitted</li>
            </ul>
          </div>
          <p>Further information:</p>
          <ul>
            <li><a href="https://creativecommons.org/about/cclicenses/" rel="nofollow noreferrer external" target="_blank">About CC Licenses</a></li>
            <li><a href="https://chooser-beta.creativecommons.org/" rel="nofollow noreferrer external" target="_blank">CC License Chooser (beta)</a></li>
            <li><a href="https://rightsstatements.org/page/1.0/" rel="nofollow noreferrer external" target="_blank">Rights Statements</a></li>
          </ul>
          <textarea rows="3" placeholder="please describe the image with a few words to enable visually impaired website visitors to comprehend what’s being shown here"
            onChange={(e) => setAlttext(e.target.value)} />
          <button className="upload" onClick={(e) => props.handleSubmission(e, selectedFile, fileName, author, license, alttext)} disabled={!selectedFile.type.includes(props.fileType) || selectedFile.size > size || props.loading || alttext.length < 1 || license.length < 1 || author.length < 1}>{props.loading ? <Loading /> : 'Upload'}</button>
          {selectedFile.type.includes(props.fileType) || <section>Please select an {props.fileType} file.</section>}
          {selectedFile.size > size && <section style={{ color: 'red' }}> File size needs to be less than {size / 1000000}MB</section>
          }
        </>
      )
      }

    </>
  )
}
export default FileUpload
