from __future__ import absolute_import

from rest_framework.response import Response

from sentry.api.bases.project import ProjectEndpoint
from sentry.rules import rules


class ProjectAlertsRulesConfigEndpoint(ProjectEndpoint):
    def get(self, request, project):
        """
        Return project rule settings.

        Return a list of available details involving alert rules.

        This is primarily used to read information about the registered rule
        actions and conditions, as well as other semi-constants for the project.
        """
        action_list = []
        condition_list = []

        # TODO: conditions need to be based on actions
        for rule_type, rule_cls in rules:
            node = rule_cls(project)
            context = {
                'id': node.id,
                'nameRaw': node.label,
                'config': node.get_config(),
            }

            if rule_type.startswith('condition/'):
                condition_list.append(context)
            elif rule_type.startswith('action/'):
                action_list.append(context)

        return Response({
            'conditions': condition_list,
            'actions': action_list,
        })
