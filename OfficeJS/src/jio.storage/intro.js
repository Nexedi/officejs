/**
 * Adds 5 storages to JIO.
 * - LocalStorage ('local')
 * - DAVStorage ('dav')
 * - ReplicateStorage ('replicate')
 * - IndexedStorage ('indexed')
 * - CryptedStorage ('crypted')
 *
 * @module JIOStorages
 */
(function(LocalOrCookieStorage, $, Base64, sjcl, Jio) {
