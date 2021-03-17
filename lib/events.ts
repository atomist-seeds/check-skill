/*
 * Copyright © 2021 Atomist, Inc.
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

import {
	EventHandler,
	github,
	project,
	repository,
	secret,
	subscription,
} from "@atomist/skill";

import { Configuration } from "./configuration";

export const onPush: EventHandler<
	subscription.types.OnPushSubscription,
	Configuration
> = async ctx => {
	const cfg = ctx.configuration.parameters;
	const repo = ctx.data.Push[0].repo;

	// Obtain the GitHub token
	const credential = await ctx.credential.resolve(
		secret.gitHubAppToken({
			owner: repo.owner,
			repo: repo.name,
		}),
	);

	// Clone repository at the sha of the push
	const clonedProject = await ctx.project.clone(
		repository.gitHub({
			owner: repo.owner,
			repo: repo.name,
			sha: ctx.data.Push[0].after.sha,
			credential,
		}),
	);

	// Create the check on the sha
	const check = await github.createCheck(ctx, clonedProject.id, {
		name: ctx.skill.name,
		title: cfg.name,
		body: "Starting checking ...",
		sha: clonedProject.id.sha,
	});

	// Do something with the clone projects
	const files = await project.globFiles(clonedProject, "**/*.yaml");
	await ctx.audit.log(files.join(", "));

	// Update the check after processing files
	await check.update({
		conclusion: cfg.severity,
	});
};
