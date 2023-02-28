/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import { createRouter } from '@backstage/plugin-permission-backend';
import {
  AuthorizeResult,
  PolicyDecision,
  isPermission,
  isResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
  PolicyAuthorizeQuery,
} from '@backstage/plugin-permission-node';
import {
  DefaultPlaylistPermissionPolicy,
  isPlaylistPermission,
} from '@backstage/plugin-playlist-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import {
  catalogConditions,
  createCatalogConditionalDecision,
} from '@backstage/plugin-catalog-backend';
import {
  catalogEntityDeletePermission,
} from '@backstage/plugin-catalog-common';

class ExamplePermissionPolicy implements PermissionPolicy {
  // private playlistPermissionPolicy = new DefaultPlaylistPermissionPolicy();
  
  async handle(
      request: PolicyQuery,
      user?: BackstageIdentityResponse,
     ): Promise<PolicyDecision> {
      if (isPermission(request.permission, catalogEntityDeletePermission)) {
        return createCatalogConditionalDecision(
          request.permission,
          catalogConditions.isEntityOwner({
            claims: user?.identity.ownershipEntityRefs ?? [],
          }),
        );
      }

      return { result: AuthorizeResult.ALLOW };
  // async handle(request: PolicyAuthorizeQuery, user?: BackstageIdentityResponse): Promise<PolicyDecision> {
      
  //   if (request.permission.name === 'catalog.entity.delete') {
  //       return createCatalogConditionalDecision(
  //         request.permission,
  //         catalogConditions.isEntityOwner(
  //           user?.identity.ownershipEntityRefs ?? []
  //         )
  //       );
    
  //   }
    
  //   return { result: AuthorizeResult.ALLOW };
  // async handle(
  //   request: PolicyQuery,
  //   user?: BackstageIdentityResponse,
  // ): Promise<PolicyDecision> {
  //  if (isResourcePermission(request.permission, 'catalog-entity')) {
  //     return createCatalogConditionalDecision(
  //       request.permission,
  //       catalogConditions.isEntityOwner({
  //         claims: user?.identity.ownershipEntityRefs ?? [],
  //       }),
  //     );
  //   }


  //   return { result: AuthorizeResult.ALLOW };
  // }
  }
}
export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    config: env.config,
    logger: env.logger,
    discovery: env.discovery,
    policy: new ExamplePermissionPolicy(),
    identity: env.identity,
  });
}
