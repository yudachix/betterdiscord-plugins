/**
 * @name Unlink
 * @author yudachix
 * @version 1.1.1
 * @description Remove links to files, URLs, etc.
 * @website https://github.com/yudachix/betterdiscord-plugins
 * @source https://github.com/yudachix/betterdiscord-plugins/blob/main/Unlink/Unlink.plugin.js
 * @updateUrl https://raw.githubusercontent.com/yudachix/betterdiscord-plugins/main/Unlink/Unlink.plugin.js
 */

const { BdApi, ZeresPluginLibrary } = globalThis
const config = {
  info: {
    name: 'Unlink',
    author: 'yudachix',
    version: '1.1.1',
    description: 'Remove links to files, URLs, etc.',
    updateUrl: 'https://raw.githubusercontent.com/yudachix/betterdiscord-plugins/main/Unlink/Unlink.plugin.js'
  }
}

module.exports = class Unlink {
  getName() {
    return config.info.name
  }

  load() {
    if (typeof ZeresPluginLibrary === 'undefined') {
      BdApi.showConfirmationModal(
        'Library Missing',
        `The library plugin needed for ${this.getName()} is missing. Please click Download Now to install it.`,
        {
          confirmText: 'Download Now',
          cancelText: 'Cancel',
          onConfirm() {
            require('https').get(
              'https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js',
              res => {
                const { statusCode } = res

                if (200 > statusCode || statusCode >= 400) {
                  return
                }

                let body = ''

                res.on('data', chunk => body += chunk)
                res.on('end', () => require('fs').writeFileSync(
                  require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'),
                  body
                ))
              }
            )
          }
        }
      )
    }

    try {
      ZeresPluginLibrary.PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.updateUrl)
    } catch (error) {
      console.error(this.getName(), 'Plugin Updater could not be reached, attempting to enable plugin.', error)

      try {
        BdApi.Plugins.enable('ZeresPluginLibrary')

        if (!BdApi.Plugins.isEnabled('ZeresPluginLibrary')) {
          throw new Error('Failed to enable ZeresPluginLibrary.')
        }

        ZeresPluginLibrary.PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.updateUrl)
      } catch (error) {
        console.error(this.getName(), 'Failed to enable ZeresPluginLibrary for Plugin Updater.', err)
        BdApi.alert('Could not enable or find ZeresPluginLibrary', 'Could not start the plugin because ZeresPluginLibrary could not be found or enabled. Please enable and/or download it manually in your plugins folder.')
        this.stop()
      }
    }
  }

  /**
   * @readonly
   * @type {Map<Element, () => void>}
   */
  #restoreFunctions = new Map

  /**
   * @readonly
   */
  static #downloadButtonSelector = (
    'a[class*="downloadWrapper-"], ' +
    'a[class*="downloadSection-"], ' +
    'a[class*="metadataDownload-"], ' +
    'a[class*="downloadLink-"][target="_blank"], ' +
    'a[class*="downloadLink-"][target="_blank"] + span[class*="downloadLink-"]'
  )

  /**
   * @readonly
   */
  static #openLinkButtonSelector = (
    '#message-open-native-link, ' +
    '#message-imageutilities-open-link, ' +
    '#image-context-imageutilities-open-link, ' +
    'div[class*="connectedAccounts-"] a[class*="anchor-"]'
  )

  /**
   * @readonly
   */
  static #anchorLinkSelector = (
    'div[class*="imageDetails-"] a[class*="anchor-"], ' +
    'div[class*="modal-"] a[class*="anchor-"], ' +
    'div[class*="userBio-"] > a[class*="anchor-"], ' +
    'div[class*="aboutMeBody-"] > a[class*="anchor-"], ' +
    'div[class*="topic-"] > a[class*="anchor-"], ' +
    'div[class*="channelName-"] > a[class*="anchor-"], ' +
    'div[class*="channelDescription-"] > a[class*="anchor-"], ' +
    'div[class*="locationText-"] > a[class*="anchor-"], ' +
    'div[class*="externalLocation-"] > a[class*="anchor-"], ' +
    'div[class*="messageContent-"] > a[class*="anchor-"], ' +
    'a[class*="embedLink-"], ' +
    'a[class*="fileNameLink-"], ' +
    'a[class*="metadataName-"]'
  )

  /**
   * @param {MouseEvent} eventData
   */
  static #onClickAnchorLink(eventData) {
    eventData.preventDefault()
    eventData.stopImmediatePropagation()
    eventData.stopPropagation()
  }

  #unlink() {
    const restoreFunctions = this.#restoreFunctions

    for (const anchorLink of document.querySelectorAll(Unlink.#anchorLinkSelector)) {
      if (restoreFunctions.has(anchorLink)) {
        continue
      }

      anchorLink.addEventListener('click', Unlink.#onClickAnchorLink)
      restoreFunctions.set(anchorLink, () => anchorLink.removeEventListener('click', Unlink.#onClickAnchorLink))
    }
  }

  /**
   * @param {MutationRecord} record
   */
  observer(record) {
    if (record.type !== 'childList') {
      return
    }

    this.#unlink()
  }

  start() {
    BdApi.injectCSS(
      this.getName(),
      (
        `${Unlink.#downloadButtonSelector}, ${Unlink.#openLinkButtonSelector} { display: none; }` +
        `${Unlink.#anchorLinkSelector} { cursor: not-allowed; color: #fff !important; } ${Unlink.#anchorLinkSelector}:hover { text-decoration: none !important; }`
      )
    )

    this.#unlink()
  }

  stop() {
    BdApi.clearCSS(this.getName())

    const restoreFunctions = this.#restoreFunctions

    for (const [element, restoreFunction] of restoreFunctions) {
      restoreFunction()
      restoreFunctions.delete(element)
    }
  }
}
