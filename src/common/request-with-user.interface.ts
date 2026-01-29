export class RequestWithUser extends Request {
  user: { id: number; email: string };
}
