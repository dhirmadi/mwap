#!/bin/bash

# Usage: ./create-feature.sh feature-name

FEATURE=$1
PASCAL_CASE=$(echo $FEATURE | sed -r 's/(^|-)([a-z])/\U\2/g')

# Create model.ts
cat > $FEATURE/model.ts << EOL
import { z } from 'zod';

export const ${PASCAL_CASE}Schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ${PASCAL_CASE} = z.infer<typeof ${PASCAL_CASE}Schema>;

// Request validation schemas
export const Create${PASCAL_CASE}Schema = ${PASCAL_CASE}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const Update${PASCAL_CASE}Schema = ${PASCAL_CASE}Schema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
EOL

# Create service.ts
cat > $FEATURE/service.ts << EOL
import type { ${PASCAL_CASE} } from './model';

export class ${PASCAL_CASE}Service {
  async create${PASCAL_CASE}(data: Partial<${PASCAL_CASE}>): Promise<${PASCAL_CASE}> {
    throw new Error('Not implemented');
  }

  async get${PASCAL_CASE}(id: string): Promise<${PASCAL_CASE}> {
    throw new Error('Not implemented');
  }

  async update${PASCAL_CASE}(id: string, data: Partial<${PASCAL_CASE}>): Promise<${PASCAL_CASE}> {
    throw new Error('Not implemented');
  }

  async delete${PASCAL_CASE}(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async list${PASCAL_CASE}s(): Promise<${PASCAL_CASE}[]> {
    throw new Error('Not implemented');
  }
}
EOL

# Create controller.ts
cat > $FEATURE/controller.ts << EOL
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../core-v2/errors';
import { ${PASCAL_CASE}Service } from './service';
import { Create${PASCAL_CASE}Schema, Update${PASCAL_CASE}Schema } from './model';

export class ${PASCAL_CASE}Controller {
  constructor(private service: ${PASCAL_CASE}Service) {}

  async create${PASCAL_CASE}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = Create${PASCAL_CASE}Schema.parse(req.body);
      const ${FEATURE} = await this.service.create${PASCAL_CASE}(data);
      res.status(201).json(${FEATURE});
    } catch (error) {
      next(error);
    }
  }

  async get${PASCAL_CASE}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ${FEATURE} = await this.service.get${PASCAL_CASE}(req.params.id);
      res.json(${FEATURE});
    } catch (error) {
      next(error);
    }
  }

  async update${PASCAL_CASE}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = Update${PASCAL_CASE}Schema.parse(req.body);
      const ${FEATURE} = await this.service.update${PASCAL_CASE}(req.params.id, data);
      res.json(${FEATURE});
    } catch (error) {
      next(error);
    }
  }

  async delete${PASCAL_CASE}(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.service.delete${PASCAL_CASE}(req.params.id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

  async list${PASCAL_CASE}s(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ${FEATURE}s = await this.service.list${PASCAL_CASE}s();
      res.json(${FEATURE}s);
    } catch (error) {
      next(error);
    }
  }
}
EOL

# Create routes.ts
cat > $FEATURE/routes.ts << EOL
import { Router } from 'express';
import { requireRoles, MWAP_ROLES } from '../../../middleware-v2/auth/roles';
import { ${PASCAL_CASE}Controller } from './controller';
import { ${PASCAL_CASE}Service } from './service';

export function create${PASCAL_CASE}Router(): Router {
  const router = Router();
  const service = new ${PASCAL_CASE}Service();
  const controller = new ${PASCAL_CASE}Controller(service);

  router.post('/',
    requireRoles(MWAP_ROLES.OWNER),
    controller.create${PASCAL_CASE}.bind(controller)
  );

  router.get('/:id',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.get${PASCAL_CASE}.bind(controller)
  );

  router.patch('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.update${PASCAL_CASE}.bind(controller)
  );

  router.delete('/:id',
    requireRoles(MWAP_ROLES.OWNER),
    controller.delete${PASCAL_CASE}.bind(controller)
  );

  router.get('/',
    requireRoles(MWAP_ROLES.MEMBER),
    controller.list${PASCAL_CASE}s.bind(controller)
  );

  return router;
}
EOL

# Create index.ts
cat > $FEATURE/index.ts << EOL
export * from './model';
export * from './service';
export * from './controller';
export { create${PASCAL_CASE}Router } from './routes';
EOL