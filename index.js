const axios = require('axios')
const { getInput, getMultilineInput, setFailed, setOutput } = require('@actions/core')
const { context } = require('@actions/github')

async function run() {
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

    const variables = Object.keys(process.env).reduce((variables, variable) => {
        if (variable.startsWith('CM_')) {
            variables[variable.substring(3)] = process.env[variable]
        }
        return variables
    }, {})

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

        const { buildId } = response.data
        setOutput('build-id', buildId)
        setOutput('build-api-url', `https://api.codemagic.io/builds/${buildId}`)
        setOutput('build-url', `https://codemagic.io/app/${appId}/build/${buildId}`)
    } catch (error) {
        let details = null
        if (error.response.status === 401 || error.response.status === 403) {
            details = 'Either app ID or token is incorrect'
        } else {
            details = error.response.data.error
        }
        setFailed(`${error.message}: ${details}`)
    }
}

run()
