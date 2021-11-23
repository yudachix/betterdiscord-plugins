/**
 * @name Unlink
 * @author yudachix
 * @version 1.4.0
 * @description Remove links to files, URLs, etc.
 * @website https://github.com/yudachix/betterdiscord-plugins
 * @source https://github.com/yudachix/betterdiscord-plugins/blob/main/Unlink/Unlink.plugin.js
 * @updateUrl https://raw.githubusercontent.com/yudachix/betterdiscord-plugins/main/Unlink/Unlink.plugin.js
 */

module.exports = class Unlink {
  /**
   * @readonly
   */
  static #BdApi = globalThis.BdApi

  /**
   * @readonly
   */
  static #ZeresPluginLibrary = globalThis.ZeresPluginLibrary

  /**
   * @readonly
   */
  static #config = Object.freeze({
    /**
     * @readonly
     */

    info: Object.freeze({
      /**
       * @readonly
       */
      name: 'Unlink',

      /**
       * @readonly
       */
      author: 'yudachix',

      /**
       * @readonly
       */
      version: '1.4.0',

      /**
       * @readonly
       */
      description: 'Remove links to files, URLs, etc.',

      /**
       * @readonly
       */
      updateUrl: 'https://raw.githubusercontent.com/yudachix/betterdiscord-plugins/main/Unlink/Unlink.plugin.js'
    })
  })

  static async #checkZeresPluginLibrary() {
    return new Promise(resolve => {
      if (typeof Unlink.#ZeresPluginLibrary !== 'undefined') {
        resolve()

        return
      }

      const BdApi = Unlink.#BdApi

      BdApi.showConfirmationModal(
        'Library Missing',
        `The library plugin needed for ${Unlink.#config.info.name} is missing. Please click Download Now to install it.`,
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
                res.on('end', () => {
                  require('fs').writeFileSync(
                    require('path').join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'),
                    body
                  )

                  resolve()
                })
              }
            )
          }
        }
      )
    })
  }

  #checkUpdate() {
    const BdApi = Unlink.#BdApi
    const ZeresPluginLibrary = Unlink.#ZeresPluginLibrary
    const configInfo = Unlink.#config.info
    const pluginName = configInfo.name

    try {
      ZeresPluginLibrary.PluginUpdater.checkForUpdate(pluginName, configInfo.version, configInfo.updateUrl)
    } catch (error) {
      console.error(pluginName, 'Plugin Updater could not be reached, attempting to enable plugin.', error)

      try {
        BdApi.Plugins.enable('ZeresPluginLibrary')

        if (!BdApi.Plugins.isEnabled('ZeresPluginLibrary')) {
          throw new Error('Failed to enable ZeresPluginLibrary.')
        }

        ZeresPluginLibrary.PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.updateUrl)
      } catch (error) {
        console.error(pluginName, 'Failed to enable ZeresPluginLibrary for Plugin Updater.', error)
        BdApi.alert('Could not enable or find ZeresPluginLibrary', 'Could not start the plugin because ZeresPluginLibrary could not be found or enabled. Please enable and/or download it manually in your plugins folder.')
        this.stop()
      }
    }
  }

  async load() {
    await Unlink.#checkZeresPluginLibrary()
    this.#checkUpdate()
  }

  /**
   * @readonly
   * @type {Set<Element>}
   */
  static #disabledAnchorElements = new Set

  /**
   * @param {MouseEvent} eventData
   */
  static #onClickAnchorLink(eventData) {
    eventData.preventDefault()
    eventData.stopImmediatePropagation()
    eventData.stopPropagation()
  }

  /**
   * @readonly
   */
  static #anchorLinkSelector = (
    // download links
    'a[class*="downloadWrapper-"], ' +
    'a[class*="downloadSection-"], ' +
    'a[class*="metadataDownload-"], ' +
    'a[class*="downloadLink-"][target="_blank"], ' +

    // open links
    '#message-open-native-link, ' +
    '#message-imageutilities-open-link, ' +
    '#image-context-imageutilities-open-link, ' +
    'div[class*="connectedAccounts-"] a[class*="anchor-"], ' +

    // links
    'div[class*="imageDetails-"] a[class*="anchor-"], ' +
    'div[class*="modal-"] > div[class*="content-"] a[class*="anchor-"], ' +
    'div[role="dialog"] div[class*="cozyMessage-"] a[class*="anchor-"], ' +
    'div[class*="userBio-"] > a[class*="anchor-"], ' +
    'div[class*="aboutMeBody-"] > a[class*="anchor-"], ' +
    'div[class*="topic-"] > a[class*="anchor-"], ' +
    'div[class*="channelName-"] > a[class*="anchor-"], ' +
    'div[class*="channelDescription-"] > a[class*="anchor-"], ' +
    'div[class*="locationText-"] > a[class*="anchor-"], ' +
    'div[class*="externalLocation-"] > a[class*="anchor-"], ' +
    'div[class*="messageContent-"] a[class*="anchor-"], ' +
    'a[class*="embedLink-"], ' +
    'a[class*="fileNameLink-"], ' +
    'a[class*="metadataName-"]'
  )

  #unlink() {
    const disabledAnchorElements = Unlink.#disabledAnchorElements
    const onClickAnchorLink = Unlink.#onClickAnchorLink

    for (const anchorLink of document.querySelectorAll(Unlink.#anchorLinkSelector)) {
      if (disabledAnchorElements.has(anchorLink)) {
        continue
      }

      anchorLink.addEventListener('click', onClickAnchorLink)
      disabledAnchorElements.add(anchorLink)
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
    this.#checkUpdate()
    Unlink.#BdApi.injectCSS(
      Unlink.#config.info.name,
      `${Unlink.#anchorLinkSelector} { cursor: not-allowed !important; color: #bbb !important; text-decoration: none !important; }`
    )
    this.#unlink()
  }

  stop() {
    Unlink.#BdApi.clearCSS(Unlink.#config.info.name)

    const disabledAnchorElements = Unlink.#disabledAnchorElements
    const onClickAnchorLink = Unlink.#onClickAnchorLink

    for (const element of disabledAnchorElements) {
      element.removeEventListener('click', onClickAnchorLink)
      disabledAnchorElements.delete(element)
    }
  }
}
