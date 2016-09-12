from __future__ import absolute_import

import six

from sentry.api.serializers import Serializer, register
from sentry.models import Rule


def _serialize_node(project, rule, data):
    from sentry.rules import rules

    rule_cls = rules.get(data['id'])
    if rule_cls is None:
        return {}

    node = rule_cls(project, data=data, rule=rule)

    return {
        'id': node.id,
        'name': node.render_label(),
        'data': {
            k: v
            for k, v in six.iteritems(node.data)
            if k != 'id'
        }
    }


@register(Rule)
class RuleSerializer(Serializer):
    def serialize(self, obj, attrs, user):
        d = {
            # XXX(dcramer): we currently serialize unsaved rule objects
            # as part of the rule editor
            'id': six.text_type(obj.id) if obj.id else None,
            'conditions': [
                _serialize_node(obj.project, obj, o)
                for o in obj.data.get('conditions', [])
            ],
            'actions': [
                _serialize_node(obj.project, obj, o)
                for o in obj.data.get('actions', [])
            ],
            'actionMatch': obj.data.get('action_match', 'all'),
            'name': obj.label,
            'dateCreated': obj.date_added,
        }
        return d
