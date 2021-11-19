/**
 * @name Unlink
 * @author yudachix
 * @version 1.0.1
 * @description Remove links to files, URLs, etc.
 * @website https://github.com/yudachix/betterdiscord-plugins
 * @source https://github.com/yudachix/betterdiscord-plugins/blob/main/Unlink/Unlink.plugin.js
 * @updateUrl https://raw.githubusercontent.com/yudachix/betterdiscord-plugins/main/Unlink/Unlink.plugin.js
 */

module.exports = class Unlink {
  #restoreFunctions = new Map

  static #saveObjectAssign(target, source) {
    const targetSaves = new Map

    for (const [k, v] of Object.entries(source)) {
      targetSaves.set(k, target[k])
      target[k] = v
    }

    return () => {
      for (const [k, v] of targetSaves) {
        target[k] = v
      }
    }
  }

  static #onClick(eventData) {
    eventData.stopPropagation()
  }

  #unlinkFromContent() {
    const restoreFunctions = this.#restoreFunctions

    for (const e of document.querySelectorAll(
      'div[id*="message-content-"] > a[class*="anchor-"], ' +
      'div[class*="topic"] > a[class*="anchor-"], ' +
      'div[class*="channelName-"] > a[class*="anchor-"], ' +
      'div[class*="locationText-"] > a[class*="anchor-"], ' +
      'div[class*="descriptionText-"] > a[class*="anchor-"], ' +
      'div[class*="embedTitle-"] > a[class*="anchor-"], ' +
      'div[class*="aboutMeBody-"] > a[class*="anchor-"], ' +
      'div[class*="userBio-"] > a[class*="anchor-"]'
    )) {
      if (restoreFunctions.has(e)) {
        continue
      }

      e.addEventListener('click', Unlink.#onClick)

      const restoreMessageContentAnchorAttribute = Unlink.#saveObjectAssign(
        e,
        { href: 'javascript:void undefined;' }
      )
      const restoreMessageContentAnchorStyle = Unlink.#saveObjectAssign(
        e.style,
        {
          color: '#fff',
          textDecoration: 'none',
          cursor: 'auto'
        }
      )

      restoreFunctions.set(
        e,
        () => {
          e.removeEventListener('click', Unlink.#onClick)
          restoreMessageContentAnchorAttribute()
          restoreMessageContentAnchorStyle()
        }
      )
    }
  }

  #unlinkFromDownloadButton() {
    const restoreFunctions = this.#restoreFunctions

    for (const e of document.querySelectorAll('svg[class*="downloadButton-"], svg[class*="metadataIcon-"]')) {
      const downloadButtonWrapper = e.parentNode

      if (restoreFunctions.has(downloadButtonWrapper)) {
        continue
      }

      const restoreDownloadButtonWrapperStyle = Unlink.#saveObjectAssign(
        downloadButtonWrapper.style,
        { display: 'none' }
      )

      restoreFunctions.set(
        downloadButtonWrapper,
        () => restoreDownloadButtonWrapperStyle()
      )
    }
  }

  #unlinkFromFileAttachment() {
    const restoreFunctions = this.#restoreFunctions

    for (const e of document.querySelectorAll('div[class*="messageAttachment-"] > div[class*="attachment-"]')) {
      const fileNameLink = e.querySelector('a[class*="fileNameLink-"]')

      if (restoreFunctions.has(fileNameLink)) {
        continue
      }

      const restoreFileNameLinkAttribute = Unlink.#saveObjectAssign(
        fileNameLink,
        { href: 'javascript:void undefined;' }
      )
      const restoreFileNameLinkStyle = Unlink.#saveObjectAssign(
        fileNameLink.style,
        {
          color: '#fff',
          textDecoration: 'none',
          cursor: 'auto'
        }
      )

      restoreFunctions.set(
        fileNameLink,
        () => {
          restoreFileNameLinkAttribute()
          restoreFileNameLinkStyle()
        }
      )
    }
  }

  #unlink() {
    this.#unlinkFromContent()
    this.#unlinkFromDownloadButton()
    this.#unlinkFromFileAttachment()
  }

  observer() {
    this.#unlink()
  }

  start() {
    this.#unlink()
  }

  stop() {
    const restoreFunctions = this.#restoreFunctions

    for (const [element, restoreFunction] of restoreFunctions) {
      restoreFunction()
      restoreFunctions.delete(element)
    }
  }
}
