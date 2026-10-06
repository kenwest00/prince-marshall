/** Dispatch from anywhere to scroll to the contact form with a reason preselected. */
export const CONTACT_TOPIC_EVENT = 'pm:contact-topic'

export function openContact(topic: string) {
  window.dispatchEvent(new CustomEvent(CONTACT_TOPIC_EVENT, { detail: topic }))
}
