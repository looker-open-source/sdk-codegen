from flask import (
    Blueprint, flash, redirect, render_template, request, url_for, session
)
import os
from werkzeug.exceptions import abort

from .auth import login_required
from .db import get_db
from .looker import get_looks, get_image_for_look

bp = Blueprint('blog', __name__)


def get_post(id, check_author=True):
    # This is a SQL query that gets the entire post object from our sqlite DB.
    post = get_db().execute(
        'SELECT p.id, title, body, look_id, look_image, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE p.id = ?',
        (id,)
    ).fetchone()
    if post is None:
        abort(404, "Post id {0} doesn't exist.".format(id))
    if check_author and post['author_id'] != session['user_id']:
        abort(403)
    return post

@bp.route('/')
def index():
    db = get_db()
    posts = db.execute(
        'SELECT p.id, title, body, look_id, look_image, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('blog/index.html', posts=posts)

@bp.route('/create', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
    #When POSTed to, this route creates a new post. When you GET it, you get the /create page.
        title = request.form['title']
        body = request.form['body']
        look_id = request.form['look_id']
        error = None
        try:
            look_image = get_image_for_look(look_id).decode("utf-8")
            # get_image_for_look returns a b64 image string representing a rendered Look.
        except Exception as e:
            error = "Error running Look: {}".format(e)

        if not title:
            error = 'Title is required.'
        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO post (title, body, author_id, look_id, look_image)'
                ' VALUES (?, ?, ?, ?, ?)',
                (title, body, session['user_id'], look_id, look_image)
            )
            db.commit()
            return redirect(url_for('blog.index'))
    # get_looks returns all available looks on the attached Looker instance.
    looks = get_looks()
    return render_template('blog/create.html', looks=looks)

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    post = get_post(id)

    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        look_id = request.form['look_id']
        error = None
        try:
            look_image = get_image_for_look(look_id).decode("utf-8")
            # get_image_for_look returns a b64 image string representing a rendered Look.
        except Exception as e:
            error = "Error running Look: {}".format(e)

        if not title:
            error = 'Title is required.'
        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE post SET title = ?, body = ?, look_id = ?, look_image = ?'
                ' WHERE id = ?',
                (title, body, look_id, look_image, id)
            )
            db.commit()
            return redirect(url_for('blog.index'))
    looks = get_looks()
    return render_template('blog/update.html', post=post, looks = looks)

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_post(id)
    db = get_db()
    db.execute('DELETE FROM post WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('blog.index'))