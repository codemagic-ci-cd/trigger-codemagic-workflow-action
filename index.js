import axios from 'axios'

import {
    getInput,
    setFailed,
    getMultilineInput,
    setOutput,
} from '@actions/core'
import { context } from '@actions/github'

const appId = getInput('app-id')
const workflowId = getInput('workflow-id')
const token = getInput('token')

const labels = getMultilineInput('labels')

let branch = getInput('branch')
let tag = getInput('tag')

if (!branch && !tag) {
    const { ref } = context
    branch = ref.split('refs/heads/')[1] || process.env.GITHUB_HEAD_REF
    tag = ref.split('refs/tags/')[1]
}

const variablePrefix = 'CM_'
const variables = Object.entries(process.env).reduce(
    (variables, [actionVariableName, value]) => {
        if (actionVariableName.startsWith(variablePrefix)) {
            const varirableName = actionVariableName.substring(variablePrefix.length)
            variables[varirableName] = value
        }
        return variables
    },
    {},
)

const softwareVersions = [
    'xcode',
    'flutter',
    'cocoapods',
    'node',
    'npm',
    'ndk',
    'java',
    'ruby',
].reduce((softwareVersions, software) => {
    const version = getInput(software)
    if (version) {
        softwareVersions[software] = version
    }
    return softwareVersions
}, {})

const url = 'https://api.codemagic.io/builds'

const payload = {
    appId,
    workflowId,
    labels,
    branch,
    tag,
    environment: { variables, softwareVersions },
}

const headers = {
    'x-auth-token': token,
}

try {
    const response = await axios.post(url, payload, { headers })

    const { buildId } = await response.data
    setOutput('build-id', buildId)
    setOutput('build-status-url', `https://api.codemagic.io/builds/${buildId}`)
    setOutput('build-html-url', `https://codemagic.io/app/${appId}/build/${buildId}`)
} catch (error) {
    let details = null
    if (error.response.status === 403) {
        details = 'Either app ID or token is incorrect'
    } else {
        details = error.response.data.error
    }
    setFailed(`${error.message}: ${details}`)
}

