from pathlib import Path

import pytest

from app.tools.documents import read_document
from app.tools.web import _public_url


def test_reads_text_attachment(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv('AGENT_ATTACHMENT_ROOT', str(tmp_path))
    document = tmp_path / 'note.md'
    document.write_text('# 标题\n内容', encoding='utf-8')
    assert '内容' in read_document(str(document))


def test_rejects_path_outside_attachment_root(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    root = tmp_path / 'root'; root.mkdir()
    outside = tmp_path / 'outside.txt'; outside.write_text('secret')
    monkeypatch.setenv('AGENT_ATTACHMENT_ROOT', str(root))
    with pytest.raises(ValueError, match='附件路径无效'):
        read_document(str(outside))


def test_rejects_private_web_address() -> None:
    with pytest.raises(ValueError, match='私网'):
        asyncio.run(_public_url('http://127.0.0.1/private'))
import asyncio
