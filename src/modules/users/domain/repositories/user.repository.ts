export abstract class UserRepository {
  abstract create(data: any);

  abstract findById(id: string);

  abstract findAll(
    tenantId: string,
    page: number,
    limit: number,
  );

  abstract countAll(tenantId: string);

  abstract delete(id: string);

  abstract block(id: string, status: boolean);

  abstract findByNip(nip: string, tenantId: string);
}