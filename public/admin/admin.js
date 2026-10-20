/* Branded previews for the content manager. Loaded right after decap-cms.js,
   which provides the CMS, h (createElement) and createClass globals. */
(function () {
  if (!window.CMS) return;

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');
  CMS.registerPreviewStyle('/admin/preview.css');

  // The site shows event times in Eastern Time (src/lib/data.ts).
  var TZ = 'America/New_York';
  function fmt(date, opts) {
    return new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: TZ }, opts)).format(date);
  }
  function toDate(value) {
    if (!value) return null;
    var d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  function isVirtual(location) {
    return /^(virtual|online|zoom)$/i.test(String(location || '').trim());
  }
  function note(text) {
    return h('p', { className: 'note' }, text);
  }
  function field(entry, key) {
    return entry.getIn(['data', key]);
  }
  function assetUrl(getAsset, path) {
    if (!path) return null;
    var asset = getAsset(path);
    return asset ? asset.toString() : null;
  }

  var EventPreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var get = function (key) { return field(entry, key); };
      var start = toDate(get('date'));
      var end = toDate(get('endDate'));
      var past = start && (end || start).getTime() < Date.now();
      var image = assetUrl(this.props.getAsset, get('image'));

      var when = 'Add a start date and time';
      if (start) {
        when = fmt(start, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + ', ' +
          fmt(start, { hour: 'numeric', minute: '2-digit' }) +
          (end ? ' to ' + fmt(end, { hour: 'numeric', minute: '2-digit' }) : '') + ' ET';
      }
      var location = isVirtual(get('location')) ? 'Virtual' : 'In person, ' + (get('location') || 'add a location');

      return h('div', { className: 'page' },
        h('p', { className: 'kicker' }, 'Preview: how this event appears on the site'),
        get('draft') ? note('Hidden on the live site: "Hide on the live site" is ticked.') : null,
        past ? note('This date has passed, so the event is listed under Past events with its recap.') : null,
        h('article', { className: 'event' },
          h('div', { className: 'date-tile' },
            h('span', { className: 'm' }, start ? fmt(start, { month: 'short' }) : 'Date'),
            start ? h('span', { className: 'd' }, fmt(start, { day: 'numeric' })) : null),
          h('div', null,
            h('h1', null, get('title') || 'Event title'),
            h('ul', { className: 'meta' },
              h('li', null, get('hideDate') ? 'Date hidden on the site' : when),
              h('li', null, location),
              get('partner') ? h('li', null, 'With ' + get('partner')) : null),
            h('p', { className: 'desc' }, get('description') || 'Add a short description.'),
            image ? h('img', { src: image, alt: get('imageAlt') || '' }) : null,
            past ? h('div', { className: 'recap' }, h('p', { className: 'label' }, 'Recap'), this.props.widgetFor('body')) : null),
          past ? null : h('div', { className: 'cta' },
            get('signupUrl') ? h('span', { className: 'btn' }, 'Sign up') : h('span', { className: 'muted' }, 'Sign-up link coming soon'))));
    },
  });

  function personPreview(kind) {
    return createClass({
      render: function () {
        var entry = this.props.entry;
        var get = function (key) { return field(entry, key); };
        var photo = assetUrl(this.props.getAsset, get('photo'));
        var details = kind === 'team'
          ? [
              h('p', { key: 'role', className: 'role' }, get('role') || 'Role'),
              h('p', { key: 'school', className: 'muted' }, get('school') || 'School'),
              h('p', { key: 'bio', className: 'bio' }, get('bio') || 'Add a short bio.'),
            ]
          : [h('p', { key: 'firm', className: 'muted' }, [get('title'), get('firm')].filter(Boolean).join(', ') || 'Title, firm')];

        return h('div', { className: 'page' },
          h('p', { className: 'kicker' }, kind === 'team' ? 'Preview: Meet the Team card' : 'Preview: home page mentor card'),
          kind === 'team' && get('founder') ? note('Shown in the Founder card above the board.') : null,
          kind === 'mentor' && get('draft') ? note('Hidden on the live site: "Hide on the live site" is ticked.') : null,
          h('article', { className: 'person' },
            photo ? h('img', { src: photo, alt: '' }) : h('div', { className: 'photo-empty' }, 'No photo yet'),
            h('h1', null, get('name') || 'Name'),
            details));
      },
    });
  }

  CMS.registerPreviewTemplate('events', EventPreview);
  CMS.registerPreviewTemplate('team', personPreview('team'));
  CMS.registerPreviewTemplate('mentors', personPreview('mentor'));
})();
