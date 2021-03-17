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
	Category,
	parameter,
	ParameterType,
	resourceProvider,
	skill,
} from "@atomist/skill";

import { Configuration } from "./lib/configuration";

export const Skill = skill<Configuration>({
	name: "check-skill",
	namespace: "atomist-seeds",
	description: "Scan committed code for well-known credentials and secrets",
	displayName: "Check Skill",
	categories: [Category.Security],

	resourceProviders: {
		github: resourceProvider.gitHub({ minRequired: 1 }),
		slack: resourceProvider.chat({ minRequired: 0 }),
	},

	parameters: {
		check: {
			type: ParameterType.Boolean,
			displayName: "Set check",
			description: "Set a GitHub check on each push",
			required: false,
			defaultValue: true,
		},
		name: {
			type: ParameterType.String,
			displayName: "Set check",
			description: "Name of the GitHub check to set",
			required: true,
		},
		severity: {
			type: ParameterType.SingleChoice,
			displayName: "Check severity",
			description: "Select severity of GitHub check to set",
			required: true,
			options: [
				{
					text: "Success",
					value: "success",
				},
				{
					text: "Failed",
					value: "action_required",
				},
				{
					text: "Neutral",
					value: "neutral",
				},
			],
		},
		repos: parameter.repoFilter(),
	},

	subscriptions: ["@atomist/skill/github/onPush"],
});
