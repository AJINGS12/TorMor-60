// TEMPORARY playtest flag: add ?debug=1 to the URL to show the debug overlay.
export const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1'
