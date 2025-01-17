import React from 'react'
import styled from 'styled-components'

const Button = styled.button`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: ${props => props.cancel ? 'var(--color-bg)' : 'var(--color-fg)'};   
  border-color: var(--color-fg);
  border-radius: unset;
  border-style: solid;
  border-width: calc(var(--margin) * 0.2);
  color: ${props => props.cancel ? 'var(--color-fg)' : 'var(--color-bg)'};
  cursor: pointer;
  height: calc(var(--margin) * 2);
  padding: calc(var(--margin) * 0.2);
  margin-top: calc(var(--margin) * 0.2);
  margin-right: calc(var(--margin) * 0.2);  
  width: ${props => props.width || '100%'};

  &: [disabled]{
  background - color: var(--color - me);
  border - color: var(--color - me);
  cursor: not - allowed;

}
`

const SimpleButton = (props) => {
  return (
    <Button
      value={props.value}
      cancel={props.cancel}
      onClick={props.onClick}
      disabled={props.disabled}
      width={props.width}
    >{props.children}
    </Button>
  )
}
export default SimpleButton
