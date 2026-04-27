export abstract class AuthRepository {
  // ===== KARYAWAN =====
  abstract findKaryawan(nip: string, tenantId: string);

  abstract findKaryawanById(karyawanId: string);

  // ===== SESSION =====
  abstract createSession(karyawanId: string);

  abstract findSession(sessionId: string);

  abstract deactivateSession(sessionId: string);

  abstract deactivateAllSessions(karyawanId: string);

  // ===== REFRESH TOKEN =====
  abstract createRefreshToken(data: {
    karyawanId: string;
    sessionId: string;
    tokenId: string;
    tokenHash: string;
    expiresAt: Date;
  });

  abstract findRefreshToken(tokenId: string);

  abstract revokeRefreshToken(id: string);

  abstract revokeAllBySession(sessionId: string);

  abstract revokeAllByUser(karyawanId: string);
}