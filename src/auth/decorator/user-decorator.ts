import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    const id = user.id;
    return id;
  },
);
